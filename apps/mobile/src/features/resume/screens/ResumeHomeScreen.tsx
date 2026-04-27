/**
 * Resume Home Screen
 * Professional PDF upload with validation, parsing, and Redux integration
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import { useUploadResumeMutation, useDeleteResumeMutation } from "@/services/resume-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCurrentStep,
  resetResume,
  loadResumeData,
  setError,
  selectError,
  setHasExistingResume,
} from "@/store/slices/resume.slice";
import { selectHasExistingResume, selectFormData } from "@/store/slices/resume.slice";
import { validatePDFFile, formatFileSize } from "@/services/pdf-validation";

export function ResumeHomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hasExistingResume = useAppSelector(selectHasExistingResume);
  const error = useAppSelector(selectError);
  const formData = useAppSelector(selectFormData);
  const [uploadResume] = useUploadResumeMutation();
  const [deleteResumeReq] = useDeleteResumeMutation();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const fileInputRef = useRef<any>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const initializeResume = async () => {
      try {
        // Reset state on mount if needed
      } catch (error) {
        console.log("Failed to initialize:", error);
      }
    };

    initializeResume();
  }, []);

  const handleFileSelect = async (file: any) => {
    if (!file) return;

    // Use validation service for comprehensive checks
    const fileInfo = {
      name: file.name,
      size: file.size || 0,
      type: file.mimeType || file.type || "application/pdf",
      uri: file.uri || file,
    };

    const validation = validatePDFFile(fileInfo);
    if (!validation.isValid) {
      Alert.alert("Invalid File", validation.error || "File validation failed.");
      return;
    }

    setSelectedFile({
      name: file.name,
      size: file.size,
      uri: file.uri || file,
    });
    setUploadSuccess(false);
  };

  const handleBrowseFiles = async () => {
    try {
      if (Platform.OS === "web") {
        fileInputRef.current?.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (result.canceled) return;

        const file = result.assets?.[0];
        if (!file) return;

        handleFileSelect({
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          uri: file.uri,
        });
      }
    } catch (_err) {
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (isSubmittingRef.current) return;
    if (!selectedFile) {
      Alert.alert("No File Selected", "Please select a PDF resume first.");
      return;
    }

    let progressInterval: NodeJS.Timeout | undefined;

    try {
      isSubmittingRef.current = true;
      setUploading(true);
      setUploadProgress(0);
      dispatch(setError(null));

      progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      // Create FormData
      const formData = new FormData();
      if (Platform.OS === "web") {
        formData.append("file", selectedFile.uri);
      } else {
        formData.append("file", {
          uri: selectedFile.uri,
          type: "application/pdf",
          name: selectedFile.name,
        } as any);
      }

      // Upload to server
      const response = await uploadResume(formData).unwrap();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response) {
        throw new Error("Invalid response from upload API");
      }

      // Save the generated user_id from backend so we can update it later
      if (response.user_id) {
        if (Platform.OS === "web") {
          try {
            window.localStorage.setItem("user_id", response.user_id);
          } catch (e) {
            console.warn("localStorage not available on web");
          }
        } else {
          await SecureStore.setItemAsync("user_id", response.user_id);
        }
      }

      // Load into Redux store - response is already ResumeParsedData structure
      dispatch(loadResumeData(response));
      setParsedResume(response);
      dispatch(setCurrentStep(1));
      dispatch(setHasExistingResume(true));

      setUploadSuccess(true);

      Alert.alert("Success", "Resume uploaded and parsed successfully!", [
        {
          text: "Continue to Builder",
          onPress: () => {
            router.push("/(tabs)/two/builder");
          },
        },
      ]);
    } catch (error: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setUploadProgress(0);

      let errorMessage = "Failed to upload resume. Please try again.";

      if (error?.status === 400) {
        errorMessage =
          error?.data?.message ||
          "Invalid file format. Please ensure the PDF is readable and not corrupted.";
      } else if (error?.status === 413) {
        errorMessage = "File size exceeds 5MB limit. Please choose a smaller file.";
      } else if (error?.status === 415) {
        errorMessage = "Invalid file type. Only PDF files are supported.";
      } else if (error?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (error?.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else if (error?.status === 0 || error?.code === "NETWORK_ERROR") {
        errorMessage = "Network connection error. Please check your internet connection.";
      } else {
        errorMessage =
          error?.data?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.";
      }

      dispatch(setError(errorMessage));
      Alert.alert("Upload Failed", errorMessage);

      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setParsedResume(null);
  };

  const handleBuildFromScratch = () => {
    dispatch(resetResume());
    dispatch(setCurrentStep(1));
    router.push("/(tabs)/two/builder");
  };

  const handleEditResume = () => {
    dispatch(setCurrentStep(1));
    router.push("/(tabs)/two/builder");
  };

  const handlePreviewResume = () => {
    router.push("/(tabs)/two/preview");
  };

  const executeDelete = async () => {
    if (isSubmittingRef.current) return;
    try {
      isSubmittingRef.current = true;

      let storedUserId: string | null = null;
      if (Platform.OS === "web") {
        try {
          storedUserId = window.localStorage.getItem("user_id");
        } catch (e) {
          console.warn("localStorage access failed:", e);
        }
      } else {
        storedUserId = await SecureStore.getItemAsync("user_id");
      }

      if (!storedUserId) {
        Alert.alert(
          "Error",
          "Unable to delete: User ID not found. Please try uploading your resume again.",
        );
        return;
      }

      await deleteResumeReq(storedUserId).unwrap();
      dispatch(resetResume());
      dispatch(setHasExistingResume(false));
      setDeleteSuccess(true);

      setTimeout(() => {
        setDeleteSuccess(false);
      }, 2500);
    } catch (err: any) {
      let errorMessage = "Failed to delete resume. Please try again.";

      if (err?.status === 404) {
        errorMessage = "Resume not found on server. It may have already been deleted.";
      } else if (err?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (err?.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else if (err?.status === 0 || err?.code === "NETWORK_ERROR") {
        errorMessage = "Network connection error. Please check your internet connection.";
      } else {
        errorMessage = err?.data?.message || err?.message || errorMessage;
      }

      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert("Delete Failed", errorMessage);
      }

      console.error("Delete error:", err);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleDeleteResume = () => {
    if (isSubmittingRef.current) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    executeDelete();
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Upload Your Resume</Text>
          <Text style={styles.subtitle}>Help us understand your professional background</Text>
        </View>

        {deleteSuccess && (
          <View
            style={[
              {
                backgroundColor: "#ecfccb",
                borderColor: "#84cc16",
                borderWidth: 1,
                borderRadius: 12,
                alignItems: "center",
                paddingVertical: 24,
                marginBottom: 20,
              },
            ]}
          >
            <MaterialIcons
              name="check-circle"
              size={48}
              color="#65a30d"
              style={{ marginBottom: 12 }}
            />
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#3f6212", marginBottom: 6 }}>
              Successfully Deleted!
            </Text>
            <Text style={{ fontSize: 15, color: "#4d7c0f", textAlign: "center" }}>
              Your resume has been completely removed.
            </Text>
          </View>
        )}

        {/* Error Alert */}
        {error && (
          <View style={styles.errorAlert}>
            <MaterialIcons name="error-outline" size={20} color="#dc2626" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
            <Pressable onPress={() => dispatch(setError(null))}>
              <MaterialIcons name="close" size={20} color="#dc2626" />
            </Pressable>
          </View>
        )}

        {/* Upload Box */}
        <View style={styles.uploadBoxWrapper}>
          {uploadSuccess && parsedResume ? (
            <View style={[styles.uploadBox, styles.successBox]}>
              <MaterialIcons name="check-circle" size={56} color="#10b981" style={styles.icon} />
              <Text style={styles.successText}>Resume Uploaded!</Text>
              <Text style={styles.successSubtext}>Your resume has been successfully parsed.</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.uploadBox, pressed && styles.uploadBoxPressed]}
              onPress={handleBrowseFiles}
            >
              <View style={styles.uploadIconContainer}>
                <MaterialIcons name="cloud-upload" size={52} color="#2563EB" />
              </View>
              <Text style={styles.uploadText}>
                {selectedFile ? "Change File" : "Upload Resume"}
              </Text>
              <Text style={styles.uploadSubtext}>Drag and drop or click to browse</Text>
              <View style={styles.formatBadge}>
                <Text style={styles.formatText}>PDF only • Max 5MB</Text>
              </View>
            </Pressable>
          )}

          {Platform.OS === "web" && (
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.name && file.size !== undefined) {
                  handleFileSelect({
                    name: file.name,
                    size: file.size,
                    uri: file,
                  });
                }
              }}
            />
          )}
        </View>

        {/* File Info Box */}
        {selectedFile && !uploadSuccess && (
          <View style={styles.fileInfoBox}>
            <View style={styles.fileInfoContent}>
              <MaterialIcons name="description" size={28} color="#3b82f6" style={styles.fileIcon} />
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
              </View>
            </View>
            {!uploading && (
              <Pressable onPress={() => setSelectedFile(null)}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </Pressable>
            )}
          </View>
        )}

        {/* Progress Bar */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        )}

        {/* Upload Buttons */}
        {selectedFile && !uploadSuccess && (
          <View style={styles.buttonGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.uploadButton,
                pressed && styles.uploadButtonPressed,
                uploading && styles.uploadButtonDisabled,
              ]}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialIcons name="send" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.uploadButtonText}>Upload Resume</Text>
                </>
              )}
            </Pressable>

            {!uploading && (
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
                onPress={() => setSelectedFile(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Parsed Data Display */}
        {uploadSuccess && parsedResume && (
          <View style={styles.parsedDataContainer}>
            {/* File Information Card */}
            {parsedResume.file_name && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="description" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>File Information</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Filename:</Text>
                    <Text style={styles.metadataValue}>{parsedResume.file_name}</Text>
                  </View>
                  {parsedResume.parse_status && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>Status:</Text>
                      <View style={styles.statusBadge}>
                        <MaterialIcons name="check-circle" size={14} color="#10b981" />
                        <Text style={styles.statusText}>{parsedResume.parse_status}</Text>
                      </View>
                    </View>
                  )}
                  {parsedResume.created_at && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>Uploaded:</Text>
                      <Text style={styles.metadataValue}>
                        {new Date(parsedResume.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {parsedResume.id && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>ID:</Text>
                      <Text style={[styles.metadataValue, styles.codeText]}>
                        {parsedResume.id.substring(0, 12)}...
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Personal Information Card */}
            {formData?.contact && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="person" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>Personal Information</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.personalName}>{formData.contact?.fullName}</Text>
                  {formData.contact?.email ? (
                    <Text style={styles.personalDetail}>{formData.contact?.email}</Text>
                  ) : null}
                  {formData.contact?.phone ? (
                    <Text style={styles.personalDetail}>{formData.contact?.phone}</Text>
                  ) : null}
                  {formData.contact?.location ? (
                    <Text style={styles.personalDetail}>{formData.contact?.location}</Text>
                  ) : null}
                  {formData.contact?.linkedin ? (
                    <Text style={styles.personalDetail}>{formData.contact?.linkedin}</Text>
                  ) : null}
                </View>
              </View>
            )}

            {/* Summary Card */}
            {formData?.summary?.text ? (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="description" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>Professional Summary</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.summaryText}>{formData.summary.text}</Text>
                </View>
              </View>
            ) : null}

            {/* Skills Card */}
            {formData?.skills && formData.skills.length > 0 && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="code" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>Skills ({formData.skills.length})</Text>
                </View>
                <View style={styles.skillsContainer}>
                  {formData.skills?.map((skill: any, index: number) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>
                        {typeof skill === "string" ? skill : skill.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Experience Card */}
            {formData?.experience && formData.experience.length > 0 && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="work" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>Experience ({formData.experience.length})</Text>
                </View>
                <View style={styles.cardContent}>
                  {formData.experience?.map((exp: any, index: number) => (
                    <View key={index} style={styles.experienceItem}>
                      <Text style={styles.expTitle}>{exp.position}</Text>
                      <Text style={styles.expCompany}>
                        {exp.company} • {exp.startDate}
                        {exp.endDate ? ` - ${exp.endDate}` : " - Present"}
                      </Text>
                      {exp.description ? (
                        <Text style={styles.expDescription}>{exp.description}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Education Card */}
            {formData?.education && formData.education.length > 0 && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="school" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>Education ({formData.education.length})</Text>
                </View>
                <View style={styles.cardContent}>
                  {formData.education?.map((edu: any, index: number) => (
                    <View key={index} style={styles.experienceItem}>
                      <Text style={styles.expTitle}>{edu.degree}</Text>
                      <Text style={styles.expCompany}>
                        {edu.school} • {edu.graduationDate}
                      </Text>
                      {edu.field ? <Text style={styles.expDescription}>{edu.field}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Projects Card */}
            {formData?.projects && formData.projects.length > 0 && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="folder-open" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>Projects ({formData.projects.length})</Text>
                </View>
                <View style={styles.cardContent}>
                  {formData.projects?.map((proj: any, index: number) => (
                    <View key={index} style={styles.experienceItem}>
                      <Text style={styles.expTitle}>{proj.name}</Text>
                      {proj.description ? (
                        <Text style={styles.expDescription}>{proj.description}</Text>
                      ) : null}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <View style={styles.techStack}>
                          {proj.technologies.map((tech: string, idx: number) => (
                            <View key={idx} style={styles.techBadge}>
                              <Text style={styles.techText}>{tech}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications Card */}
            {formData?.certifications && formData.certifications.length > 0 && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="verified" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>
                    Certifications ({formData.certifications.length})
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  {formData.certifications?.map((cert: any, index: number) => (
                    <View key={index} style={styles.experienceItem}>
                      <Text style={styles.expTitle}>{cert.name}</Text>
                      <Text style={styles.expCompany}>
                        {cert.issuer}
                        {cert.issueDate ? ` • ${cert.issueDate}` : ""}
                      </Text>
                      {cert.expiryDate && (
                        <Text style={styles.expDescription}>Expires: {cert.expiryDate}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Languages Card */}
            {formData?.languages && formData.languages.length > 0 && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="language" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>Languages ({formData.languages.length})</Text>
                </View>
                <View style={styles.skillsContainer}>
                  {formData.languages?.map((lang: any, index: number) => (
                    <View key={index} style={styles.languageBadge}>
                      <Text style={styles.languageText}>
                        {typeof lang === "string" ? lang : lang.name}
                        {lang.proficiency ? ` - ${lang.proficiency}` : ""}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {/* Achievements Card */}
            {formData?.achievements && formData.achievements.length > 0 && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="star" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>
                    Achievements ({formData.achievements.length})
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  {formData.achievements?.map((achievement: any, index: number) => (
                    <View key={index} style={styles.achievementItem}>
                      <MaterialIcons name="done" size={18} color="#10b981" />
                      <Text style={styles.achievementText}>
                        {typeof achievement === "string" ? achievement : achievement.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Extracurricular Card */}
            {formData?.extracurricular && formData.extracurricular.length > 0 && (
              <View style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="sports" size={22} color="#2563EB" />
                  <Text style={styles.cardTitle}>
                    Extracurricular ({formData.extracurricular.length})
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  {formData.extracurricular?.map((activity: any, index: number) => (
                    <View key={index} style={styles.achievementItem}>
                      <MaterialIcons name="done" size={18} color="#2563EB" />
                      <Text style={styles.achievementText}>
                        {typeof activity === "string" ? activity : activity.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Pressable
                style={({ pressed }) => [
                  styles.uploadAnotherButton,
                  { flex: 1 },
                  pressed && styles.uploadAnotherPressed,
                ]}
                onPress={handleUploadAnother}
              >
                <MaterialIcons name="refresh" size={20} color="#2563EB" />
                <Text style={styles.uploadAnotherText}>Upload Another</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.uploadAnotherButton,
                  { flex: 1, backgroundColor: "#2563EB", borderColor: "#2563EB" },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleEditResume}
              >
                <Text style={[styles.uploadAnotherText, { color: "white" }]}>Continue</Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color="white"
                  style={{ marginLeft: 4 }}
                />
              </Pressable>
            </View>
          </View>
        )}

        {/* Info Cards */}
        {!selectedFile && !uploadSuccess && (
          <View style={styles.infoCardsContainer}>
            <View style={styles.infoCard}>
              <MaterialIcons name="check" size={24} color="#10b981" style={styles.infoIcon} />
              <Text style={styles.infoTitle}>Easy Upload</Text>
              <Text style={styles.infoDescription}>Upload your resume in a single click</Text>
            </View>

            <View style={styles.infoCard}>
              <MaterialIcons name="security" size={24} color="#3b82f6" style={styles.infoIcon} />
              <Text style={styles.infoTitle}>Secure</Text>
              <Text style={styles.infoDescription}>Your data is encrypted and secure</Text>
            </View>

            <View style={styles.infoCard}>
              <MaterialIcons name="speed" size={24} color="#f59e0b" style={styles.infoIcon} />
              <Text style={styles.infoTitle}>Fast Processing</Text>
              <Text style={styles.infoDescription}>Instant resume analysis and parsing</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {!selectedFile && !uploadSuccess && !hasExistingResume && (
          <View style={styles.altActionContainer}>
            <Pressable
              onPress={handleBuildFromScratch}
              style={({ pressed }) => [
                styles.altActionButton,
                pressed && styles.altActionButtonPressed,
              ]}
            >
              <MaterialIcons name="edit" size={20} color="#059669" />
              <Text style={styles.altActionText}>Build from Scratch</Text>
            </Pressable>
          </View>
        )}

        {hasExistingResume && !selectedFile && !uploadSuccess && (
          <View style={[styles.altActionContainer, { flexDirection: "row", gap: 12 }]}>
            <Pressable
              onPress={handleEditResume}
              style={({ pressed }) => [
                styles.altActionButton,
                { flex: 1 },
                pressed && styles.altActionButtonPressed,
              ]}
            >
              <MaterialIcons name="edit" size={20} color="#059669" />
              <Text style={styles.altActionText}>Edit Resume</Text>
            </Pressable>

            <Pressable
              onPress={handleDeleteResume}
              style={({ pressed }) => [
                styles.altActionButton,
                { flex: 1, borderColor: "#fee2e2", backgroundColor: "#fef2f2" },
                pressed && styles.altActionButtonPressed,
              ]}
            >
              <MaterialIcons name="delete" size={20} color="#dc2626" />
              <Text style={[styles.altActionText, { color: "#dc2626" }]}>Delete</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* In-App Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="warning" size={40} color="#dc2626" />
            </View>
            <Text style={styles.modalTitle}>Delete Resume?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete your resume? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalCancelButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalDeleteButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={confirmDelete}
              >
                <MaterialIcons name="delete" size={18} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.modalDeleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 12,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  errorAlert: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    padding: 12,
    marginBottom: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  errorContent: {
    flex: 1,
    marginLeft: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991b1b",
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 12,
    color: "#7f1d1d",
    lineHeight: 16,
  },
  uploadBoxWrapper: {
    marginBottom: 24,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 48,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  uploadBoxPressed: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FAFC",
    borderStyle: "solid",
  },
  successBox: {
    borderWidth: 2,
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
    borderStyle: "solid",
  },
  uploadIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 16,
  },
  formatBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  formatText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 14,
    color: "#047857",
  },
  fileInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fileInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: "#9ca3af",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  buttonGroup: {
    gap: 12,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  uploadButtonPressed: {
    backgroundColor: "#2563eb",
  },
  uploadButtonDisabled: {
    backgroundColor: "#93c5fd",
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    backgroundColor: "white",
  },
  cancelButtonPressed: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  parsedDataContainer: {
    marginTop: 8,
    gap: 16,
  },
  dataCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 10,
  },
  cardContent: {
    gap: 8,
  },
  personalName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  personalDetail: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  experienceItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  expTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  expCompany: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 6,
  },
  expDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  uploadAnotherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  uploadAnotherPressed: {
    backgroundColor: "#DBEAFE",
  },
  uploadAnotherText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 8,
  },
  infoCardsContainer: {
    marginTop: 24,
    gap: 16,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  altActionContainer: {
    marginTop: 8,
  },
  altActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 14,
  },
  altActionButtonPressed: {
    backgroundColor: "#A7F3D0",
  },
  altActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#059669",
    marginLeft: 8,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  metadataLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    flex: 0.4,
  },
  metadataValue: {
    fontSize: 13,
    color: "#64748B",
    flex: 0.6,
    textAlign: "right",
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
    textTransform: "capitalize",
  },
  summaryText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  techStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  techBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  techText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B45309",
  },
  languageBadge: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4F46E5",
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: 10,
  },
  achievementText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  modalDeleteButton: {
    backgroundColor: "#dc2626",
  },
  modalDeleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
});
