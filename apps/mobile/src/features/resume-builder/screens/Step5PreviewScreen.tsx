import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBuilderDraft,
  selectBuilderIsSaving,
  selectBuilderLastSavedAt,
  selectBuilderIsDirty,
  setCurrentStep,
  updateSummary,
  updateExperience,
  updateProjects,
  resetBuilderState,
} from "@/store/slices/resume-builder.slice";
import {
  useLazyExportBuiltResumePdfQuery,
  useUpdateBuiltResumeMutation,
} from "@/services/resume-builder-api";
import { EnhanceButton } from "../components/EnhanceButton";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAutoSave } from "../hooks/useAutoSave";

export function Step5PreviewScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const isSaving = useAppSelector(selectBuilderIsSaving);
  const isDirty = useAppSelector(selectBuilderIsDirty);
  const lastSavedAt = useAppSelector(selectBuilderLastSavedAt);

  const [triggerExport, { isFetching: isExporting }] = useLazyExportBuiltResumePdfQuery();
  const [updateBuiltResume, { isLoading: isForceSaving }] = useUpdateBuiltResumeMutation();
  const [autoEnhanceExport, setAutoEnhanceExport] = useState(false);

  // Hook up debounced auto-save
  useAutoSave();

  // Export PDF trigger
  const handleExport = async () => {
    try {
      // Force save any pending changes first to ensure PDF matches current input
      await updateBuiltResume(draftResume).unwrap();

      const result = await triggerExport({ auto_enhance: autoEnhanceExport }).unwrap();
      if (result?.url) {
        // Open Returned PDF SAS URL immediately
        await Linking.openURL(result.url);
      } else {
        throw new Error("Export response did not contain PDF URL");
      }
    } catch (error) {
      console.error("PDF Export failure:", error);
      Alert.alert("Export Failed", "Failed to generate or open PDF resume. Please try again.");
    }
  };

  const handleDone = async () => {
    if (isDirty) {
      try {
        await updateBuiltResume(draftResume).unwrap();
      } catch (error) {
        console.error("Final save before exit failed:", error);
        Alert.alert("Save Failed", "We could not save your resume changes. Please try again.");
        return; // Halt navigation and state reset
      }
    }
    dispatch(resetBuilderState());
    router.replace("/");
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Step Indicator Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={styles.stepNumber}>Step 5 of 5</Text>
              {isSaving ? (
                <Text style={styles.saveBadge}>Saving...</Text>
              ) : lastSavedAt ? (
                <Text style={styles.savedBadge}>Saved {lastSavedAt}</Text>
              ) : null}
            </View>
            <Text style={styles.headerTitle}>Review & Export</Text>
            <Text style={styles.headerSubtitle}>Preview your resume and download PDF</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          {/* PDF Configuration & Export Panel */}
          <View style={styles.exportSection}>
            <Text style={styles.exportTitle}>PDF Export Options</Text>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Auto AI Enhance Export</Text>
                <Text style={styles.toggleDesc}>
                  Automatically optimize summaries and descriptions before generation.
                </Text>
              </View>
              <Pressable
                onPress={() => setAutoEnhanceExport(!autoEnhanceExport)}
                style={[styles.toggleBtn, autoEnhanceExport && styles.toggleBtnActive]}
              >
                <Text
                  style={[styles.toggleBtnText, autoEnhanceExport && styles.toggleBtnTextActive]}
                >
                  {autoEnhanceExport ? "ENABLED" : "DISABLED"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleExport}
              disabled={isExporting || isForceSaving}
              style={[
                styles.exportButton,
                (isExporting || isForceSaving) && styles.exportButtonDisabled,
              ]}
            >
              {isExporting || isForceSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name="download" size={16} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.exportButtonText}>Export & Download PDF</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Structured Resume Review Draft Container */}
          <View style={styles.previewBox}>
            <Text style={styles.previewHeader}>RESUME DRAFT PREVIEW</Text>

            {/* Profile Info Row */}
            <View style={styles.previewRow}>
              {draftResume.photoUrl ? (
                <Image source={{ uri: draftResume.photoUrl }} style={styles.previewPhoto} />
              ) : (
                <View style={styles.previewPhotoPlaceholder}>
                  <Text style={styles.previewPhotoInitial}>
                    {draftResume.contact.fullName?.charAt(0) || "U"}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.previewName}>
                  {draftResume.contact.fullName || "Your Full Name"}
                </Text>
                <Text style={styles.previewTitle}>
                  {draftResume.occupation || "Target Occupation"}
                </Text>
                <Text style={styles.previewContactDetail}>
                  ✉ {draftResume.contact.email || "email@example.com"} • 📞{" "}
                  {draftResume.contact.phone || "Phone Number"}
                </Text>
                {draftResume.contact.location ? (
                  <Text style={styles.previewContactDetail}>📍 {draftResume.contact.location}</Text>
                ) : null}
              </View>
            </View>

            {/* Config metadata details */}
            <View style={styles.metadataBadgeRow}>
              <View style={styles.metadataBadge}>
                <Text style={styles.metadataBadgeText}>
                  Template: {draftResume.templateName.toUpperCase()}
                </Text>
              </View>
              <View style={styles.metadataBadge}>
                <Text style={styles.metadataBadgeText}>
                  Layout: {draftResume.layout.replace("_", " ").toUpperCase()}
                </Text>
              </View>
              {draftResume.experienceLevel ? (
                <View style={styles.metadataBadge}>
                  <Text style={styles.metadataBadgeText}>Level: {draftResume.experienceLevel}</Text>
                </View>
              ) : null}
            </View>

            {/* Professional Summary and AI Enhancer */}
            <View style={styles.previewSection}>
              <View style={styles.previewSectionHeader}>
                <Text style={styles.previewSectionTitle}>Professional Summary</Text>
                <EnhanceButton
                  sectionName="Summary"
                  textToEnhance={draftResume.summary}
                  onEnhanced={(enhancedText) => {
                    dispatch(updateSummary(enhancedText));
                  }}
                />
              </View>
              <Text style={styles.previewSummaryText}>
                {draftResume.summary || "No professional summary added yet."}
              </Text>
            </View>

            {/* Work Experiences */}
            {draftResume.experience && draftResume.experience.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Work Experience</Text>
                {draftResume.experience.map((exp, idx) => (
                  <View key={exp.id || idx} style={styles.previewItem}>
                    <View style={styles.previewItemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.previewItemTitle}>{exp.role}</Text>
                        <Text style={styles.previewItemCompany}>
                          {exp.company} • {exp.location || "Remote"}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.previewItemDate}>
                          {exp.startDate} - {exp.endDate || "Present"}
                        </Text>
                        <EnhanceButton
                          sectionName={`Experience - ${exp.company}`}
                          textToEnhance={exp.description}
                          onEnhanced={(enhancedText) => {
                            const updated = draftResume.experience.map((item) =>
                              item.id === exp.id ? { ...item, description: enhancedText } : item,
                            );
                            dispatch(updateExperience(updated));
                          }}
                        />
                      </View>
                    </View>
                    {exp.description ? (
                      <Text style={styles.previewItemDesc}>{exp.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* Education Items */}
            {draftResume.education && draftResume.education.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Education</Text>
                {draftResume.education.map((edu, idx) => (
                  <View key={edu.id || idx} style={styles.previewItem}>
                    <View style={styles.previewItemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.previewItemTitle}>{edu.degree}</Text>
                        <Text style={styles.previewItemCompany}>
                          {edu.institution} {edu.field ? `• ${edu.field}` : ""}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.previewItemDate}>
                          {edu.startDate} - {edu.endDate || edu.endYear}
                        </Text>
                      </View>
                    </View>
                    {edu.gpa ? <Text style={styles.previewItemDesc}>GPA: {edu.gpa}</Text> : null}
                  </View>
                ))}
              </View>
            )}

            {/* Skills chip display */}
            {draftResume.skills && draftResume.skills.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Skills</Text>
                <View style={styles.chipRow}>
                  {draftResume.skills.map((skill) => (
                    <View key={skill} style={styles.previewChip}>
                      <Text style={styles.previewChipText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Spoken Languages */}
            {draftResume.languages && draftResume.languages.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Languages</Text>
                <View style={styles.chipRow}>
                  {draftResume.languages.map((lang) => (
                    <View key={lang} style={styles.previewChip}>
                      <Text style={styles.previewChipText}>{lang}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications list */}
            {draftResume.certifications && draftResume.certifications.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Certifications</Text>
                <View style={styles.chipRow}>
                  {draftResume.certifications.map((cert) => (
                    <View key={cert} style={styles.previewChip}>
                      <Text style={styles.previewChipText}>{cert}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Projects list and AI Enhancer */}
            {draftResume.projects && draftResume.projects.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Projects</Text>
                {draftResume.projects.map((proj, idx) => (
                  <View key={proj.id || idx} style={styles.previewItem}>
                    <View style={styles.previewItemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.previewItemTitle}>{proj.name}</Text>
                        {proj.date ? (
                          <Text style={styles.previewItemCompany}>{proj.date}</Text>
                        ) : null}
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <EnhanceButton
                          sectionName={`Project - ${proj.name}`}
                          textToEnhance={proj.description}
                          onEnhanced={(enhancedText) => {
                            const updated = draftResume.projects.map((item) =>
                              item.id === proj.id ? { ...item, description: enhancedText } : item,
                            );
                            dispatch(updateProjects(updated));
                          }}
                        />
                      </View>
                    </View>
                    {proj.description ? (
                      <Text style={styles.previewItemDesc}>{proj.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Navigation Buttons footer */}
          <View style={styles.footerRow}>
            <Pressable onPress={() => dispatch(setCurrentStep(4))} style={styles.backButton}>
              <Feather name="arrow-left" size={16} color="#4b5563" style={{ marginRight: 6 }} />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <Pressable
              onPress={handleDone}
              disabled={isExporting || isForceSaving}
              style={[
                styles.doneButton,
                (isExporting || isForceSaving) && styles.doneButtonDisabled,
              ]}
            >
              {isForceSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text style={styles.doneButtonText}>Finish Wizard</Text>
                  <Feather name="check" size={16} color="white" style={{ marginLeft: 6 }} />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    paddingBottom: 48,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepNumber: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "600",
  },
  saveBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#d97706",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savedBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  formContainer: {
    padding: 16,
  },
  exportSection: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exportTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 8,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
  },
  toggleDesc: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
    paddingRight: 12,
  },
  toggleBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: "#10b981",
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
  },
  toggleBtnTextActive: {
    color: "white",
  },
  exportButton: {
    flexDirection: "row",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  exportButtonDisabled: {
    backgroundColor: "#a7f3d0",
  },
  exportButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  previewBox: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  previewHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9ca3af",
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 6,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  previewPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  previewPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  previewPhotoInitial: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6b7280",
  },
  previewName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  previewTitle: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
  previewContactDetail: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  metadataBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 10,
  },
  metadataBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  metadataBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4b5563",
  },
  previewSection: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
    paddingBottom: 12,
  },
  previewSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewSummaryText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 16,
  },
  previewItem: {
    marginBottom: 12,
  },
  previewItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  previewItemTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  previewItemCompany: {
    fontSize: 11,
    color: "#4b5563",
    marginTop: 2,
  },
  previewItemDate: {
    fontSize: 10,
    color: "#6b7280",
  },
  previewItemDesc: {
    fontSize: 11,
    color: "#4b5563",
    lineHeight: 15,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  previewChip: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  previewChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1d4ed8",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  doneButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
});
