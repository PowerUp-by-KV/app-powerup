import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateSkills,
  updateProjects,
  updateCertifications,
  updateLanguages,
  selectBuilderDraft,
  selectBuilderIsSaving,
  selectBuilderLastSavedAt,
  setCurrentStep,
} from "@/store/slices/resume-builder.slice";
import { TextInput } from "@/features/resume/components/TextInput";
import { TagInput } from "@/features/resume/components/TagInput";
import { DynamicFieldList } from "@/features/resume/components/DynamicFieldList";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import type { BuilderProject } from "../types/resume-builder.types";
import { useAutoSave } from "../hooks/useAutoSave";
import { useThemeToggle } from "@/hooks/useThemeToggle";

export function Step3SkillsScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const isSaving = useAppSelector(selectBuilderIsSaving);
  const lastSavedAt = useAppSelector(selectBuilderLastSavedAt);
  const { isDark } = useThemeToggle();

  const skills = draftResume.skills || [];
  const projects = draftResume.projects || [];
  const certifications = draftResume.certifications || [];
  const languages = draftResume.languages || [];

  // Local modals form triggers
  const [showProjModal, setShowProjModal] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projForm, setProjForm] = useState<Partial<BuilderProject>>({
    name: "",
    date: "",
    description: "",
    technologies: [],
  });
  const [projErrors, setProjErrors] = useState<Record<string, string>>({});
  const [techInput, setTechInput] = useState("");

  // Hook up debounced auto-save
  useAutoSave();

  // Helper unique keys builder
  const makeId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const resetProjForm = () => {
    setProjForm({
      name: "",
      date: "",
      description: "",
      technologies: [],
    });
    setEditingProjId(null);
    setProjErrors({});
    setTechInput("");
  };

  // Project Handlers
  const validateProj = () => {
    const errs: Record<string, string> = {};
    if (!projForm.name?.trim()) errs.name = "Project name is required";
    setProjErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProj = () => {
    if (!validateProj()) return;

    let updated: BuilderProject[];
    if (editingProjId) {
      updated = projects.map((item) =>
        item.id === editingProjId ? ({ ...item, ...projForm } as BuilderProject) : item,
      );
    } else {
      updated = [...projects, { ...projForm, id: makeId() } as BuilderProject];
    }

    dispatch(updateProjects(updated));
    setShowProjModal(false);
    setEditingProjId(null);
    setProjForm({
      name: "",
      date: "",
      description: "",
      technologies: [],
    });
    setProjErrors({});
    setTechInput("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: isDark ? "#0f172a" : "#f9fafb" }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.container}>
          {/* Step Indicator Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: isDark ? "#1e293b" : "white",
                borderBottomColor: isDark ? "#334155" : "#e5e7eb",
              },
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <Text style={[styles.stepNumber, { color: isDark ? "#9ca3af" : "#4b5563" }]}>
                  Step 3 of 5
                </Text>
                {isSaving ? (
                  <Text style={styles.saveBadge}>Saving...</Text>
                ) : lastSavedAt ? (
                  <Text style={styles.savedBadge}>Saved {lastSavedAt}</Text>
                ) : null}
              </View>
              <Text style={[styles.headerTitle, { color: isDark ? "#f8fafc" : "#1f2937" }]}>
                Skills & Projects
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? "#94a3b8" : "#6b7280" }]}>
                Showcase your capabilities and credentials
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* Skills TagInput Section */}
            <View style={[styles.section, { backgroundColor: isDark ? "#1e293b" : "white" }]}>
              <View
                style={[
                  styles.sectionHeader,
                  { borderBottomColor: isDark ? "#334155" : "#f3f4f6" },
                ]}
              >
                <MaterialIcons
                  name="code"
                  size={20}
                  color={isDark ? "#60a5fa" : "#2563EB"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.sectionTitle, { color: isDark ? "#f8fafc" : "#111827" }]}>
                  Skills
                </Text>
              </View>

              <TagInput
                label="Technical & Core Skills"
                placeholder="e.g., React Native, TypeScript, Python"
                value={skills.map((s) => ({ id: s, name: s }))}
                onAdd={(chip) => {
                  if (!skills.includes(chip.name)) {
                    dispatch(updateSkills([...skills, chip.name]));
                  }
                }}
                onRemove={(id) => {
                  dispatch(updateSkills(skills.filter((s) => s !== id)));
                }}
              />
            </View>

            {/* Projects Section */}
            <View style={[styles.section, { backgroundColor: isDark ? "#1e293b" : "white" }]}>
              <View
                style={[
                  styles.sectionHeader,
                  { borderBottomColor: isDark ? "#334155" : "#f3f4f6" },
                ]}
              >
                <MaterialIcons
                  name="folder-open"
                  size={20}
                  color={isDark ? "#60a5fa" : "#2563EB"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.sectionTitle, { color: isDark ? "#f8fafc" : "#111827" }]}>
                  Featured Projects
                </Text>
              </View>

              <DynamicFieldList
                items={projects}
                onAdd={() => {
                  setEditingProjId(null);
                  setShowProjModal(true);
                }}
                onRemove={(id) => {
                  dispatch(updateProjects(projects.filter((item) => item.id !== id)));
                }}
                onEdit={(item) => {
                  setEditingProjId(item.id);
                  setProjForm(item);
                  setShowProjModal(true);
                }}
                addButtonLabel="Add Project"
                emptyMessage="No projects added yet."
                renderItem={(item) => (
                  <View>
                    <Text style={[styles.itemTitle, { color: isDark ? "#f1f5f9" : "#1f2937" }]}>
                      {item.name}
                    </Text>
                    {item.date ? (
                      <Text
                        style={[styles.itemSubtitle, { color: isDark ? "#94a3b8" : "#4b5563" }]}
                      >
                        {item.date}
                      </Text>
                    ) : null}
                    {item.description ? (
                      <Text
                        numberOfLines={2}
                        style={[styles.itemDesc, { color: isDark ? "#cbd5e1" : "#6b7280" }]}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                    {item.technologies && item.technologies.length > 0 && (
                      <View style={styles.techStackRow}>
                        {item.technologies.map((t) => (
                          <View
                            key={t}
                            style={[
                              styles.techBadge,
                              { backgroundColor: isDark ? "#334155" : "#f3f4f6" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.techBadgeText,
                                { color: isDark ? "#cbd5e1" : "#4b5563" },
                              ]}
                            >
                              {t}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Certifications TagInput Section */}
            <View style={[styles.section, { backgroundColor: isDark ? "#1e293b" : "white" }]}>
              <View
                style={[
                  styles.sectionHeader,
                  { borderBottomColor: isDark ? "#334155" : "#f3f4f6" },
                ]}
              >
                <MaterialIcons
                  name="verified"
                  size={20}
                  color={isDark ? "#60a5fa" : "#2563EB"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.sectionTitle, { color: isDark ? "#f8fafc" : "#111827" }]}>
                  Certifications
                </Text>
              </View>

              <TagInput
                label="Professional Certifications"
                placeholder="e.g., AWS Developer Associate"
                value={certifications.map((c) => ({ id: c, name: c }))}
                onAdd={(chip) => {
                  if (!certifications.includes(chip.name)) {
                    dispatch(updateCertifications([...certifications, chip.name]));
                  }
                }}
                onRemove={(id) => {
                  dispatch(updateCertifications(certifications.filter((c) => c !== id)));
                }}
              />
            </View>

            {/* Languages TagInput Section */}
            <View style={[styles.section, { backgroundColor: isDark ? "#1e293b" : "white" }]}>
              <View
                style={[
                  styles.sectionHeader,
                  { borderBottomColor: isDark ? "#334155" : "#f3f4f6" },
                ]}
              >
                <MaterialIcons
                  name="public"
                  size={20}
                  color={isDark ? "#60a5fa" : "#2563EB"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.sectionTitle, { color: isDark ? "#f8fafc" : "#111827" }]}>
                  Languages
                </Text>
              </View>

              <TagInput
                label="Spoken & Written Languages"
                placeholder="e.g., English, Hindi, Spanish"
                value={languages.map((l) => ({ id: l, name: l }))}
                onAdd={(chip) => {
                  if (!languages.includes(chip.name)) {
                    dispatch(updateLanguages([...languages, chip.name]));
                  }
                }}
                onRemove={(id) => {
                  dispatch(updateLanguages(languages.filter((l) => l !== id)));
                }}
              />
            </View>

            {/* Navigation Buttons footer */}
            <View style={styles.footerRow}>
              <Pressable
                onPress={() => dispatch(setCurrentStep(2))}
                style={[
                  styles.backButton,
                  {
                    backgroundColor: isDark ? "#1e293b" : "white",
                    borderColor: isDark ? "#334155" : "#d1d5db",
                  },
                ]}
              >
                <Feather
                  name="arrow-left"
                  size={16}
                  color={isDark ? "#cbd5e1" : "#4b5563"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.backButtonText, { color: isDark ? "#f8fafc" : "#374151" }]}>
                  Back
                </Text>
              </Pressable>
              <Pressable onPress={() => dispatch(setCurrentStep(4))} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next Screen</Text>
                <Feather name="arrow-right" size={16} color="white" style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Project Add/Edit Modal */}
        <Modal
          visible={showProjModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowProjModal(false);
            resetProjForm();
          }}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  paddingBottom: Math.max(16, insets.bottom),
                  backgroundColor: isDark ? "#1e293b" : "white",
                },
              ]}
            >
              <ScrollView style={{ flex: 1 }}>
                <View
                  style={[
                    styles.modalHeader,
                    { borderBottomColor: isDark ? "#334155" : "#e5e7eb" },
                  ]}
                >
                  <Text style={[styles.modalTitle, { color: isDark ? "#f8fafc" : "#111827" }]}>
                    {editingProjId ? "Edit Project Details" : "Add Project Details"}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowProjModal(false);
                      resetProjForm();
                    }}
                  >
                    <MaterialIcons name="close" size={20} color={isDark ? "#cbd5e1" : "#374151"} />
                  </Pressable>
                </View>

                <TextInput
                  label="Project Name"
                  required
                  placeholder="e.g., E-Commerce Mobile App"
                  value={projForm.name}
                  onChangeText={(text) => setProjForm({ ...projForm, name: text })}
                  error={projErrors.name}
                />

                <TextInput
                  label="Date / Period"
                  placeholder="e.g., Jan 2024"
                  value={projForm.date}
                  onChangeText={(text) => setProjForm({ ...projForm, date: text })}
                />

                <TextInput
                  label="Project Description"
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your project contribution, architecture, and goals..."
                  value={projForm.description}
                  onChangeText={(text) => setProjForm({ ...projForm, description: text })}
                />

                {/* Technologies chip tags input list */}
                <View style={{ marginBottom: 16 }}>
                  <View style={styles.techInputRow}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        label="Technologies Used"
                        placeholder="e.g., Flutter (press add)"
                        value={techInput}
                        onChangeText={setTechInput}
                      />
                    </View>
                    <Pressable
                      onPress={() => {
                        if (
                          techInput.trim() &&
                          !projForm.technologies?.includes(techInput.trim())
                        ) {
                          setProjForm({
                            ...projForm,
                            technologies: [...(projForm.technologies || []), techInput.trim()],
                          });
                          setTechInput("");
                        }
                      }}
                      style={styles.techAddBtn}
                    >
                      <Text style={styles.techAddBtnText}>Add</Text>
                    </Pressable>
                  </View>
                  {projForm.technologies && projForm.technologies.length > 0 && (
                    <View style={styles.techBadgesContainer}>
                      {projForm.technologies.map((t) => (
                        <View
                          key={t}
                          style={[
                            styles.techModalBadge,
                            { backgroundColor: isDark ? "#0f172a" : "#e0f2fe" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.techModalBadgeText,
                              { color: isDark ? "#38bdf8" : "#0369a1" },
                            ]}
                          >
                            {t}
                          </Text>
                          <Pressable
                            onPress={() => {
                              setProjForm({
                                ...projForm,
                                technologies: projForm.technologies?.filter((x) => x !== t) || [],
                              });
                            }}
                          >
                            <Text
                              style={[
                                styles.techModalRemove,
                                { color: isDark ? "#0ea5e9" : "#0284c7" },
                              ]}
                            >
                              ✕
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <Pressable onPress={handleSaveProj} style={styles.saveModalBtn}>
                  <Text style={styles.saveModalBtnText}>Save Project</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
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
    gap: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  techStackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  techBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  techBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#4b5563",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "85%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  techInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  techAddBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 16,
  },
  techAddBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  techBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  techModalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  techModalBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0369a1",
  },
  techModalRemove: {
    fontSize: 12,
    color: "#0284c7",
    marginLeft: 6,
  },
  saveModalBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  saveModalBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
});
