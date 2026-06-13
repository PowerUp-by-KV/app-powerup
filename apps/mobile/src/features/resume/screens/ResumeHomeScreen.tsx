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
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import {
  useUploadResumeMutation,
  useDeleteResumeMutation,
  useGetResumeQuery,
} from "@/services/resume-api";
import { useGetResumeStatusQuery } from "@/services/resume-api";
import { useGetProfileQuery } from "@/services/auth-api";
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
import { validatePDFFile, formatFileSize, type FileInfo } from "@/services/pdf-validation";
import type { ResumeRead } from "@/services/resume-api";

type SelectedResumeFile = Omit<FileInfo, "uri"> & {
  uri: string | Blob;
};

interface PickedResumeFile {
  name: string;
  size?: number;
  mimeType?: string;
  type?: string;
  uri: string | Blob;
}

interface ApiRequestError {
  status?: number;
  code?: string;
  data?: {
    message?: string;
  };
  message?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPickerCanceled = (result: unknown) => {
  if (!isRecord(result)) return true;
  if (typeof result.canceled === "boolean") return result.canceled;
  return result.type === "cancel";
};

const toPickedDocument = (value: unknown): PickedResumeFile | undefined => {
  if (!isRecord(value) || typeof value.name !== "string" || typeof value.uri !== "string") {
    return undefined;
  }

  return {
    name: value.name,
    size: typeof value.size === "number" ? value.size : undefined,
    mimeType: typeof value.mimeType === "string" ? value.mimeType : undefined,
    uri: value.uri,
  };
};

const getPickedDocument = (result: unknown): PickedResumeFile | undefined => {
  if (!isRecord(result)) return undefined;

  if (Array.isArray(result.assets)) {
    return toPickedDocument(result.assets[0]);
  }

  return result.type === "success" ? toPickedDocument(result) : undefined;
};

export function ResumeHomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: profile } = useGetProfileQuery();
  const userId = (profile as { id?: string } | undefined)?.id ?? "";
  const { data: existingResume } = useGetResumeQuery(userId, { skip: !userId });
  const { data: resumeStatus } = useGetResumeStatusQuery();

  const hasExistingResume =
    useAppSelector(selectHasExistingResume) || (resumeStatus?.uploaded ?? false);
  const error = useAppSelector(selectError);
  const formData = useAppSelector(selectFormData);
  const [uploadResume] = useUploadResumeMutation();
  const [deleteResumeReq] = useDeleteResumeMutation();

  const [selectedFile, setSelectedFile] = useState<SelectedResumeFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [parsedResume, setParsedResume] = useState<ResumeRead | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isSubmittingRef = useRef(false);

  // Pre-load existing resume into Redux store when the user already uploaded one.
  useEffect(() => {
    if (existingResume && existingResume.parse_status === "completed") {
      dispatch(loadResumeData(existingResume));
      dispatch(setHasExistingResume(true));
    }
  }, [existingResume, dispatch]);

  const handleFileSelect = async (file: PickedResumeFile) => {
    if (!file) return;

    // Use validation service for comprehensive checks
    const fileInfo: FileInfo = {
      name: file.name,
      size: file.size || 0,
      type: file.mimeType || file.type || "application/pdf",
      uri: typeof file.uri === "string" ? file.uri : file.name,
    };

    const validation = validatePDFFile(fileInfo);
    if (!validation.isValid) {
      Alert.alert("Invalid File", validation.error || "File validation failed.");
      return;
    }

    setSelectedFile({
      name: file.name,
      type: fileInfo.type,
      size: fileInfo.size,
      uri: file.uri,
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

        if (isPickerCanceled(result)) return;

        const file = getPickedDocument(result);
        if (!file) return;

        handleFileSelect({
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          uri: file.uri,
        });
      }
    } catch {
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (isSubmittingRef.current) return;
    if (!selectedFile) {
      Alert.alert("No File Selected", "Please select a PDF resume first.");
      return;
    }

    try {
      isSubmittingRef.current = true;
      setUploading(true);
      dispatch(setError(null));

      // Create FormData
      const uploadData = new FormData();
      if (Platform.OS === "web") {
        uploadData.append("file", selectedFile.uri);
      } else {
        uploadData.append("file", {
          uri: selectedFile.uri,
          type: "application/pdf",
          name: selectedFile.name,
        } as unknown as Blob);
      }

      // Upload to server
      const response = await uploadResume(uploadData).unwrap();

      if (!response) {
        throw new Error("Invalid response from upload API");
      }

      // Save the generated user_id from backend so we can update it later
      if (response.user_id) {
        if (Platform.OS === "web") {
          try {
            window.localStorage.setItem("user_id", response.user_id);
          } catch {
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
          text: "Continue",
          onPress: () => {
            router.push("/resume/score" as never);
          },
        },
      ]);
    } catch (error: unknown) {
      const apiError = error as ApiRequestError;

      let errorMessage = "Failed to upload resume. Please try again.";

      if (apiError.status === 400) {
        errorMessage =
          apiError.data?.message ||
          "Invalid file format. Please ensure the PDF is readable and not corrupted.";
      } else if (apiError.status === 413) {
        errorMessage = "File size exceeds 5MB limit. Please choose a smaller file.";
      } else if (apiError.status === 415) {
        errorMessage = "Invalid file type. Only PDF files are supported.";
      } else if (apiError.status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (apiError.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else if (apiError.status === 0 || apiError.code === "NETWORK_ERROR") {
        errorMessage = "Network connection error. Please check your internet connection.";
      } else {
        errorMessage =
          apiError.data?.message ||
          apiError.message ||
          "An unexpected error occurred. Please try again.";
      }

      dispatch(setError(errorMessage));
      Alert.alert("Upload Failed", errorMessage);

      console.error("Upload error:", apiError);
    } finally {
      setUploading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setParsedResume(null);
  };

  const handleBuildFromScratch = () => {
    dispatch(resetResume());
    dispatch(setCurrentStep(1));
    router.push("/resume/builder?mode=scratch" as never);
  };

  const handleEditResume = () => {
    dispatch(setCurrentStep(1));
    router.push("/resume/builder" as never);
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
    } catch (err: unknown) {
      const apiError = err as ApiRequestError;
      let errorMessage = "Failed to delete resume. Please try again.";

      if (apiError.status === 404) {
        errorMessage = "Resume not found on server. It may have already been deleted.";
      } else if (apiError.status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (apiError.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else if (apiError.status === 0 || apiError.code === "NETWORK_ERROR") {
        errorMessage = "Network connection error. Please check your internet connection.";
      } else {
        errorMessage = apiError.data?.message || apiError.message || errorMessage;
      }

      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert("Delete Failed", errorMessage);
      }

      console.error("Delete error:", apiError);
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

  if (uploading) {
    return (
      <View style={styles.fullScreenLoader}>
        <View style={styles.skeletonLoaderContainer}>
          <View
            style={[
              styles.skeletonPaper,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              Platform.OS === "web" ? ({ filter: "blur(4px)" } as any) : {},
            ]}
          >
            {/* Left sidebar block */}
            <View style={styles.skeletonSidebar} />

            {/* Right content blocks */}
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonRow}>
                <View style={[styles.skeletonBlock, { flex: 1, height: 40 }]} />
                <View style={[styles.skeletonBlock, { flex: 0.8, height: 40 }]} />
              </View>
              <View style={[styles.skeletonBlock, { height: 60 }]} />
              <View style={[styles.skeletonBlock, { height: 60 }]} />
              <View style={[styles.skeletonBlock, { height: 60 }]} />
              <View style={styles.skeletonRow}>
                <View style={[styles.skeletonBlock, { flex: 1, height: 40 }]} />
                <View style={[styles.skeletonBlock, { flex: 1, height: 40 }]} />
              </View>
            </View>
          </View>

          {/* Overlay with Text and Spinner directly on frosted glass */}
          <View style={styles.skeletonOverlay}>
            <Text style={styles.analyzingText}>Analysing Resume...</Text>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Pressable onPress={() => router.replace("/home" as never)} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={26} color="#1f2937" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainTitle}>Upload Your Resume</Text>
            <Text style={styles.subtitle}>Help us understand your professional background</Text>
          </View>
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

        {/* Override Caption */}
        {hasExistingResume && !selectedFile && !uploadSuccess && (
          <Text
            style={{
              textAlign: "center",
              color: "#f59e0b",
              marginBottom: 12,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Note: This would override the existing resume and you will be using the resume which
            will be uploaded here.
          </Text>
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
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.uploadBox]}
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
            </TouchableOpacity>
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
                    type: file.type,
                    uri: file,
                  });
                }
              }}
            />
          )}
        </View>

        {/* File Info Box */}
        {selectedFile && !uploadSuccess && !uploading && (
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

        {/* Upload Buttons */}
        {selectedFile && !uploadSuccess && !uploading && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.uploadButton]}
              onPress={handleUpload}
            >
              <MaterialIcons name="send" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.uploadButtonText}>Upload Resume</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.5}
              style={[styles.cancelButton]}
              onPress={() => setSelectedFile(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
                  {formData.skills?.map((skill, index) => (
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
                  {formData.experience?.map((exp, index) => (
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
                  {formData.education?.map((edu, index) => (
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
                  {formData.projects?.map((proj, index) => (
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
                  {formData.certifications?.map((cert, index) => {
                    if (typeof cert === "string") {
                      return (
                        <View key={index} style={styles.experienceItem}>
                          <Text style={styles.expTitle}>{cert}</Text>
                        </View>
                      );
                    }
                    return (
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
                    );
                  })}
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
                  {formData.languages?.map((lang, index) => (
                    <View key={index} style={styles.languageBadge}>
                      <Text style={styles.languageText}>
                        {typeof lang === "string"
                          ? lang
                          : `${lang.name || ""}${lang.proficiency ? ` - ${lang.proficiency}` : ""}`}
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
                  {formData.achievements?.map((achievement, index) => (
                    <View key={index} style={styles.achievementItem}>
                      <MaterialIcons name="done" size={18} color="#10b981" />
                      <Text style={styles.achievementText}>{achievement}</Text>
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
                  {formData.extracurricular?.map((activity, index) => (
                    <View key={index} style={styles.achievementItem}>
                      <MaterialIcons name="done" size={18} color="#2563EB" />
                      <Text style={styles.achievementText}>{activity}</Text>
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
                  pressed ? styles.uploadAnotherPressed : undefined,
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
                  pressed ? { opacity: 0.8 } : undefined,
                ]}
                onPress={() => router.push("/resume/score" as never)}
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
        {!selectedFile && !uploadSuccess && (
          <View style={styles.altActionContainer}>
            {hasExistingResume && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEditResume}
                style={[
                  styles.altActionButton,
                  { backgroundColor: "#10b981", marginBottom: 16, shadowColor: "#10b981" },
                ]}
              >
                <MaterialIcons name="restore" size={24} color="white" />
                <Text style={styles.altActionText}>Continue with Existing Resume</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBuildFromScratch}
              style={[styles.altActionButton]}
            >
              <MaterialIcons name="edit" size={24} color="white" />
              <Text style={styles.altActionText}>Build from Scratch</Text>
            </TouchableOpacity>

            {hasExistingResume && (
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleDeleteResume}
                style={[
                  styles.altActionButton,
                  {
                    backgroundColor: "transparent",
                    marginTop: 16,
                    borderWidth: 1,
                    borderColor: "#ef4444",
                    shadowOpacity: 0,
                    elevation: 0,
                  },
                ]}
              >
                <MaterialIcons name="delete" size={24} color="#ef4444" />
                <Text style={[styles.altActionText, { color: "#ef4444" }]}>
                  Delete Existing Resume
                </Text>
              </TouchableOpacity>
            )}
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
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={confirmDelete}
              >
                <MaterialIcons name="delete" size={18} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
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
    backgroundColor: "#f3f4f6",
  },
  fullScreenLoader: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  contentContainer: {
    flexGrow: 1,
  },
  skeletonLoaderContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f3f4f6", // Matches app background
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  skeletonPaper: {
    width: "100%",
    maxWidth: 500, // Max width of the "paper"
    aspectRatio: 1 / 1.414, // A4 aspect ratio
    backgroundColor: "white",
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  skeletonSidebar: {
    width: 60,
    backgroundColor: "#3b82f6",
    height: "100%",
  },
  skeletonContent: {
    flex: 1,
    gap: 32,
    padding: 48,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 32,
  },
  skeletonBlock: {
    backgroundColor: "#cbd5e1",
    borderRadius: 8,
  },
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(248,250,252,0.8)", // slightly more washed out like the picture
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 16,
  },
  container: {
    flex: 1,
    padding: 24,
    width: "100%",
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  backButton: {
    marginRight: 16,
    marginTop: 4,
    padding: 4,
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
    borderWidth: 0,
    borderRadius: 24,
    padding: 48,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  uploadBoxPressed: {
    backgroundColor: "#F8FAFC",
  },
  successBox: {
    borderWidth: 0,
    backgroundColor: "#FFFFFF",
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
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
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
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
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
    backgroundColor: "#3b82f6",
    borderRadius: 30,
    paddingVertical: 18,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  altActionButtonPressed: {
    backgroundColor: "#2563eb",
  },
  altActionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginLeft: 10,
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
