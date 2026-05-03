/**
 * Preview & Submit Screen - Step 4 of 4
 * Review resume and submit for saving
 */

import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectFormData,
  previousStep,
  setLastSaved,
  setIsSaving,
  setError,
  resetResume,
  selectError,
  selectIsSaving,
  setHasExistingResume,
} from "@/store/slices/resume.slice";
import { useUpdateResumeMutation, useDeleteResumeMutation } from "@/services/resume-api";
import { useState, useEffect, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { ApiErrorHandler } from "@/services/error-handler";

const getErrorStatus = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" || typeof status === "string" ? status : undefined;
};

export function PreviewScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectFormData);
  const isSaving = useAppSelector(selectIsSaving);
  const error = useAppSelector(selectError);
  const [updateResume, { isLoading: isUpdating }] = useUpdateResumeMutation();
  const [deleteResume] = useDeleteResumeMutation();
  const [userId, setUserId] = useState<string>("");
  const isSubmittingRef = useRef(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        // Try to get user ID from secure storage or local storage
        let storedUserId: string | null = null;

        if (Platform.OS === "web") {
          try {
            storedUserId = window.localStorage.getItem("user_id");
          } catch {
            console.warn("localStorage not available on web");
          }
        } else {
          storedUserId = await SecureStore.getItemAsync("user_id");
        }

        setUserId(storedUserId ?? "");
      } catch (err) {
        console.warn("Failed to get user ID from secure storage:", err);
        setUserId("");
      }
    };

    loadUserId();
  }, []);

  const validateForm = (): boolean => {
    if (!formData.contact.fullName?.trim()) {
      dispatch(setError("Full name is required"));
      return false;
    }
    if (!formData.contact.email?.trim()) {
      dispatch(setError("Email is required"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current || isDeletingLocal) return;
    try {
      isSubmittingRef.current = true;
      console.log("Starting save process...");
      if (!validateForm()) {
        console.warn("Validation failed before save");
        Alert.alert("Validation Error", "Please fill in all required fields.");
        return;
      }

      if (!userId) {
        console.warn("No user ID found before save");
        Alert.alert(
          "Unable to Save",
          "No uploaded resume was found for this session. Please upload your resume before saving changes.",
        );
        return;
      }

      console.log("Dispatching save for user ID:", userId);
      dispatch(setIsSaving(true));
      dispatch(setError(null));

      const response = await updateResume({
        userId,
        data: formData,
      }).unwrap();

      console.log("Save successful! Response:", response);
      const saveTime = new Date().toLocaleString();
      dispatch(setLastSaved(saveTime));

      setSuccessMessage("Your resume has been saved successfully!");
      setShowSuccess(true);

      setTimeout(() => {
        dispatch(setHasExistingResume(true));
        router.replace("/(tabs)/two");
      }, 2000);
    } catch (error: unknown) {
      console.error("Save error caught:", error);
      const parsedError = ApiErrorHandler.parseError(error, "update");
      const errorMessage = parsedError.userMessage || "Failed to save resume. Please try again.";

      dispatch(setError(errorMessage));
      Alert.alert("Save Failed", errorMessage);
    } finally {
      console.log("Save process finished, resetting saving state.");
      dispatch(setIsSaving(false));
      isSubmittingRef.current = false;
    }
  };

  const executeDelete = async () => {
    if (!userId) {
      Alert.alert(
        "Unable to Delete",
        "No uploaded resume was found for this session. Please upload your resume before deleting it.",
      );
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsDeletingLocal(true);
      dispatch(setError(null));

      console.log("Sending DELETE request for user ID:", userId);
      const response = await deleteResume(userId).unwrap();
      console.log("Delete successful! Response:", response);

      setSuccessMessage("Resume deleted successfully!");
      setShowSuccess(true);

      setTimeout(() => {
        dispatch(resetResume());
        dispatch(setHasExistingResume(false));
        router.replace("/(tabs)/two");
      }, 2000);
    } catch (error: unknown) {
      console.error("Delete error:", error);
      const errorStatus = getErrorStatus(error);
      if (errorStatus === 404 || errorStatus === "FETCH_ERROR") {
        // Already deleted or unreachable, force local deletion
        setSuccessMessage("Resume deleted successfully!");
        setShowSuccess(true);
        setTimeout(() => {
          dispatch(resetResume());
          dispatch(setHasExistingResume(false));
          router.replace("/(tabs)/two");
        }, 2000);
      } else {
        const parsedError = ApiErrorHandler.parseError(error, "delete");
        const errorMessage = parsedError.userMessage || "Failed to delete resume.";
        dispatch(setError(errorMessage));
        Alert.alert("Delete Failed", errorMessage);
      }
    } finally {
      setIsDeletingLocal(false);
      isSubmittingRef.current = false;
    }
  };

  const handleDelete = () => {
    if (isSubmittingRef.current || isDeletingLocal) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    executeDelete();
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.stepNumber}>Step 4 of 4</Text>
            <Text style={styles.headerTitle}>Review & Submit</Text>
            <Text style={styles.headerSubtitle}>Preview your complete resume</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
        </View>

        {/* Error Alert */}
        {error && (
          <View style={styles.errorAlert}>
            <MaterialIcons name="error-outline" size={20} color="#dc2626" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          </View>
        )}

        {/* Preview Content */}
        <View style={styles.formContainer}>
          {/* Contact Section */}
          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>{formData.contact.fullName}</Text>
            <Text style={styles.previewSubtitle}>{formData.contact.email}</Text>
            {formData.contact.phone ? (
              <Text style={styles.previewText}>{formData.contact.phone}</Text>
            ) : null}
            {formData.contact.location ? (
              <Text style={styles.previewText}>{formData.contact.location}</Text>
            ) : null}
            {formData.contact.linkedin ? (
              <Text style={styles.previewText}>{formData.contact.linkedin}</Text>
            ) : null}
          </View>

          {/* Summary Section */}
          {formData.summary?.text ? (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Professional Summary</Text>
              <Text style={styles.previewText}>{formData.summary.text}</Text>
            </View>
          ) : null}

          {/* Experience Section */}
          {formData.experience.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Experience</Text>
              {formData.experience.map((exp) => (
                <View key={exp.id} style={styles.previewItem}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemDate}>
                      {exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate}
                    </Text>
                  </View>
                  <Text style={styles.itemCompany}>{exp.company}</Text>
                  {exp.description ? (
                    <Text style={styles.itemDescription}>{exp.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {/* Education Section */}
          {formData.education.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Education</Text>
              {formData.education.map((edu) => (
                <View key={edu.id} style={styles.previewItem}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemDate}>{edu.graduationDate}</Text>
                  </View>
                  <Text style={styles.itemCompany}>{edu.school}</Text>
                  <Text style={styles.itemDescription}>{edu.field}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills Section */}
          {formData.skills.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Skills</Text>
              <View style={styles.skillsList}>
                {formData.skills.map((skill) => (
                  <View key={skill.id} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects Section */}
          {formData.projects && formData.projects.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Projects</Text>
              {formData.projects.map((project) => (
                <View key={project.id || project.name} style={styles.previewItem}>
                  <Text style={styles.itemTitle}>{project.name}</Text>
                  {project.description ? (
                    <Text style={styles.itemDescription}>{project.description}</Text>
                  ) : null}
                  {project.technologies && project.technologies.length > 0 && (
                    <View style={styles.techStack}>
                      {project.technologies.map((tech, idx) => (
                        <View key={idx} style={styles.techBadge}>
                          <Text style={styles.techText}>{tech}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {project.link ? <Text style={styles.itemLink}>{project.link}</Text> : null}
                </View>
              ))}
            </View>
          )}

          {/* Certifications Section */}
          {formData.certifications && formData.certifications.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Certifications</Text>
              {formData.certifications.map((cert) => (
                <View key={cert.id || cert.name} style={styles.previewItem}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{cert.name}</Text>
                  </View>
                  <Text style={styles.itemCompany}>{cert.issuer}</Text>
                  {cert.issueDate ? (
                    <Text style={styles.itemDescription}>Issued: {cert.issueDate}</Text>
                  ) : null}
                  {cert.expiryDate ? (
                    <Text style={styles.itemDescription}>Expires: {cert.expiryDate}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {/* Languages Section */}
          {formData.languages && formData.languages.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Languages</Text>
              <View style={styles.skillsList}>
                {formData.languages.map((language) => (
                  <View key={language.id || language.name} style={styles.languageBadge}>
                    <Text style={styles.languageText}>
                      {language.name}
                      {language.proficiency ? ` • ${language.proficiency}` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Achievements Section */}
          {formData.achievements && formData.achievements.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Achievements</Text>
              {formData.achievements.map((achievement, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{achievement}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Extracurricular Section */}
          {formData.extracurricular && formData.extracurricular.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Extracurricular Activities</Text>
              {formData.extracurricular.map((activity, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{activity}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Summary Card */}
          {showSuccess ? (
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: "#ecfccb",
                  borderColor: "#84cc16",
                  alignItems: "center",
                  paddingVertical: 32,
                },
              ]}
            >
              <MaterialIcons
                name="check-circle"
                size={56}
                color="#65a30d"
                style={{ marginBottom: 16 }}
              />
              <Text style={{ fontSize: 22, fontWeight: "700", color: "#3f6212", marginBottom: 8 }}>
                {successMessage.toLowerCase().includes("deleted")
                  ? "Successfully Deleted!"
                  : "Successfully Updated!"}
              </Text>
              <Text style={{ fontSize: 16, color: "#4d7c0f", textAlign: "center" }}>
                {successMessage}
              </Text>
            </View>
          ) : (
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <MaterialIcons name="check-circle" size={24} color="#10b981" />
                <Text style={styles.summaryCardTitle}>Resume Complete</Text>
              </View>
              <Text style={styles.summaryCardText}>
                Your resume is ready to submit. Click the button below to save your changes.
              </Text>
            </View>
          )}

          {/* Navigation Buttons */}
          {!showSuccess && (
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                  (isSaving || isUpdating || isDeletingLocal) && styles.buttonDisabled,
                ]}
                onPress={() => dispatch(previousStep())}
                disabled={isSaving || isUpdating || isDeletingLocal}
              >
                <MaterialIcons name="arrow-back" size={20} color="#2563EB" />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                  (isSaving || isUpdating || isDeletingLocal) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSaving || isUpdating || isDeletingLocal}
              >
                {isUpdating || isSaving ? (
                  <>
                    <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Saving...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="white" />
                    <Text style={styles.primaryButtonText}>Save & Submit</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* Delete Button */}
          {!showSuccess && (
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
                (isSaving || isDeletingLocal) && styles.buttonDisabled,
              ]}
              onPress={handleDelete}
              disabled={isSaving || isDeletingLocal}
            >
              {isDeletingLocal ? (
                <>
                  <ActivityIndicator color="#dc2626" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.deleteButtonText}>Deleting...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="delete-outline" size={18} color="#dc2626" />
                  <Text style={styles.deleteButtonText}>Delete Resume</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
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
              Are you sure you want to delete this resume? This action cannot be undone.
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
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 0,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
  },
  errorAlert: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 6,
    alignItems: "flex-start",
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
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  previewSection: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 16,
  },
  previewSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 2,
  },
  previewHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  previewText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  previewItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  itemDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  itemCompany: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#dbeafe",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  summaryCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 16,
    marginBottom: 28,
  },
  summaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  summaryCardText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 34,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  secondaryButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    gap: 8,
  },
  deleteButtonPressed: {
    backgroundColor: "#fecaca",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
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
  bulletItem: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    width: 24,
  },
  bulletText: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
    lineHeight: 18,
  },
  itemLink: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 4,
    textDecorationLine: "underline",
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
