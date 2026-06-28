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
  updateExperience,
  updateEducation,
  selectBuilderDraft,
  selectBuilderIsSaving,
  selectBuilderLastSavedAt,
  setCurrentStep,
} from "@/store/slices/resume-builder.slice";
import { TextInput } from "@/features/resume/components/TextInput";
import { DynamicFieldList } from "@/features/resume/components/DynamicFieldList";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import type { BuilderExperience, BuilderEducation } from "../types/resume-builder.types";
import { useAutoSave } from "../hooks/useAutoSave";
import { DatePicker } from "../components/DatePicker";
import { useThemeToggle } from "@/hooks/useThemeToggle";

export function Step2ExperienceScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const isSaving = useAppSelector(selectBuilderIsSaving);
  const lastSavedAt = useAppSelector(selectBuilderLastSavedAt);
  const { isDark } = useThemeToggle();

  const experience = draftResume.experience || [];
  const education = draftResume.education || [];

  // Local modals form triggers
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState<Partial<BuilderExperience>>({
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    highlights: [],
    technologies: [],
    currentlyWorking: false,
  });
  const [expErrors, setExpErrors] = useState<Record<string, string>>({});

  const [showEduModal, setShowEduModal] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduForm, setEduForm] = useState<Partial<BuilderEducation>>({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    startYear: "",
    endYear: "",
    gpa: "",
    location: "",
  });
  const [eduErrors, setEduErrors] = useState<Record<string, string>>({});

  // Hook up debounced auto-save
  useAutoSave();

  // Helper unique keys builder
  const makeId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const resetExpForm = () => {
    setExpForm({
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      highlights: [],
      technologies: [],
      currentlyWorking: false,
    });
    setEditingExpId(null);
    setExpErrors({});
  };

  const resetEduForm = () => {
    setEduForm({
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      startYear: "",
      endYear: "",
      gpa: "",
      location: "",
    });
    setEditingEduId(null);
    setEduErrors({});
  };

  // Experience Handlers
  const validateExp = () => {
    const errs: Record<string, string> = {};
    if (!expForm.company?.trim()) errs.company = "Company is required";
    if (!expForm.role?.trim()) errs.role = "Role / Title is required";
    if (!expForm.startDate?.trim()) errs.startDate = "Start date is required";
    setExpErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveExp = () => {
    if (!validateExp()) return;

    let updated: BuilderExperience[];
    const finalExpForm = {
      ...expForm,
      endDate: expForm.currentlyWorking ? "" : expForm.endDate || "",
    };

    if (editingExpId) {
      updated = experience.map((item) =>
        item.id === editingExpId ? ({ ...item, ...finalExpForm } as BuilderExperience) : item,
      );
    } else {
      updated = [...experience, { ...finalExpForm, id: makeId() } as BuilderExperience];
    }

    dispatch(updateExperience(updated));
    setShowExpModal(false);
    setEditingExpId(null);
    resetExpForm();
  };

  // Education Handlers
  const validateEdu = () => {
    const errs: Record<string, string> = {};
    if (!eduForm.institution?.trim()) errs.institution = "Institution is required";
    if (!eduForm.degree?.trim()) errs.degree = "Degree is required";
    setEduErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdu = () => {
    if (!validateEdu()) return;

    let updated: BuilderEducation[];
    if (editingEduId) {
      updated = education.map((item) =>
        item.id === editingEduId ? ({ ...item, ...eduForm } as BuilderEducation) : item,
      );
    } else {
      updated = [...education, { ...eduForm, id: makeId() } as BuilderEducation];
    }

    dispatch(updateEducation(updated));
    setShowEduModal(false);
    setEditingEduId(null);
    setEduForm({
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      startYear: "",
      endYear: "",
      gpa: "",
      location: "",
    });
    setEduErrors({});
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
                  Step 2 of 5
                </Text>
                {isSaving ? (
                  <Text style={styles.saveBadge}>Saving...</Text>
                ) : lastSavedAt ? (
                  <Text style={styles.savedBadge}>Saved {lastSavedAt}</Text>
                ) : null}
              </View>
              <Text style={[styles.headerTitle, { color: isDark ? "#f8fafc" : "#1f2937" }]}>
                Experience & Education
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? "#94a3b8" : "#6b7280" }]}>
                Tell recruiters about your history
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* Work Experience Section */}
            <View style={[styles.section, { backgroundColor: isDark ? "#1e293b" : "white" }]}>
              <View
                style={[
                  styles.sectionHeader,
                  { borderBottomColor: isDark ? "#334155" : "#f3f4f6" },
                ]}
              >
                <MaterialIcons
                  name="work"
                  size={20}
                  color={isDark ? "#60a5fa" : "#2563EB"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.sectionTitle, { color: isDark ? "#f8fafc" : "#111827" }]}>
                  Work Experience
                </Text>
              </View>

              <DynamicFieldList
                items={experience}
                onAdd={() => {
                  setEditingExpId(null);
                  setShowExpModal(true);
                }}
                onRemove={(id) => {
                  dispatch(updateExperience(experience.filter((item) => item.id !== id)));
                }}
                onEdit={(item) => {
                  setEditingExpId(item.id);
                  setExpForm({
                    ...item,
                    currentlyWorking: !item.endDate || item.endDate === "Present",
                  });
                  setShowExpModal(true);
                }}
                addButtonLabel="Add Work Experience"
                emptyMessage="No work experience added yet."
                renderItem={(item) => (
                  <View>
                    <Text style={[styles.itemTitle, { color: isDark ? "#f8fafc" : "#1f2937" }]}>
                      {item.role}
                    </Text>
                    <Text style={[styles.itemSubtitle, { color: isDark ? "#94a3b8" : "#4b5563" }]}>
                      {item.company} • {item.startDate} - {item.endDate || "Present"}
                    </Text>
                    {item.description ? (
                      <Text
                        numberOfLines={2}
                        style={[styles.itemDesc, { color: isDark ? "#cbd5e1" : "#6b7280" }]}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            {/* Education Section */}
            <View style={[styles.section, { backgroundColor: isDark ? "#1e293b" : "white" }]}>
              <View
                style={[
                  styles.sectionHeader,
                  { borderBottomColor: isDark ? "#334155" : "#f3f4f6" },
                ]}
              >
                <MaterialIcons
                  name="school"
                  size={20}
                  color={isDark ? "#60a5fa" : "#2563EB"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.sectionTitle, { color: isDark ? "#f8fafc" : "#111827" }]}>
                  Education
                </Text>
              </View>

              <DynamicFieldList
                items={education}
                onAdd={() => {
                  setEditingEduId(null);
                  setShowEduModal(true);
                }}
                onRemove={(id) => {
                  dispatch(updateEducation(education.filter((item) => item.id !== id)));
                }}
                onEdit={(item) => {
                  setEditingEduId(item.id);
                  setEduForm(item);
                  setShowEduModal(true);
                }}
                addButtonLabel="Add Education"
                emptyMessage="No education history added yet."
                renderItem={(item) => (
                  <View>
                    <Text style={[styles.itemTitle, { color: isDark ? "#f8fafc" : "#1f2937" }]}>
                      {item.degree}
                    </Text>
                    <Text style={[styles.itemSubtitle, { color: isDark ? "#94a3b8" : "#4b5563" }]}>
                      {item.institution} {item.field ? `• ${item.field}` : ""}
                    </Text>
                    {item.endYear || item.endDate ? (
                      <Text style={[styles.itemDesc, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>
                        Graduation Year: {item.endYear || item.endDate}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            {/* Navigation Buttons footer */}
            <View style={styles.footerRow}>
              <Pressable
                onPress={() => dispatch(setCurrentStep(1))}
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
              <Pressable onPress={() => dispatch(setCurrentStep(3))} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next Screen</Text>
                <Feather name="arrow-right" size={16} color="white" style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Experience Add/Edit Modal */}
        <Modal
          visible={showExpModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowExpModal(false);
            resetExpForm();
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
                    {editingExpId ? "Edit Work Experience" : "Add Work Experience"}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowExpModal(false);
                      resetExpForm();
                    }}
                  >
                    <MaterialIcons name="close" size={20} color={isDark ? "#cbd5e1" : "#374151"} />
                  </Pressable>
                </View>

                <TextInput
                  label="Company"
                  required
                  placeholder="e.g., Google"
                  value={expForm.company}
                  onChangeText={(text) => setExpForm({ ...expForm, company: text })}
                  error={expErrors.company}
                />

                <TextInput
                  label="Role / Title"
                  required
                  placeholder="e.g., Senior Software Engineer"
                  value={expForm.role}
                  onChangeText={(text) => setExpForm({ ...expForm, role: text })}
                  error={expErrors.role}
                />

                <TextInput
                  label="Location"
                  placeholder="e.g., Bangalore, Karnataka"
                  value={expForm.location}
                  onChangeText={(text) => setExpForm({ ...expForm, location: text })}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <DatePicker
                      label="Start Date"
                      required
                      placeholder="Select Date"
                      value={expForm.startDate || ""}
                      onChange={(date) => {
                        setExpForm((prev) => ({ ...prev, startDate: date }));
                        if (expErrors.startDate)
                          setExpErrors((prev) => ({ ...prev, startDate: "" }));
                      }}
                      error={expErrors.startDate}
                    />
                  </View>
                  {!expForm.currentlyWorking && (
                    <View style={{ flex: 1 }}>
                      <DatePicker
                        label="End Date"
                        placeholder="Select Date"
                        value={expForm.endDate || ""}
                        onChange={(date) => {
                          setExpForm((prev) => ({ ...prev, endDate: date }));
                        }}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.checkboxRow}>
                  <Pressable
                    onPress={() => {
                      const isCurrent = !expForm.currentlyWorking;
                      setExpForm((prev) => ({
                        ...prev,
                        currentlyWorking: isCurrent,
                        endDate: isCurrent ? "" : prev.endDate || "",
                      }));
                    }}
                    style={[styles.checkbox, !!expForm.currentlyWorking && styles.checkboxActive]}
                  >
                    {!!expForm.currentlyWorking && (
                      <MaterialIcons name="check" size={14} color="white" />
                    )}
                  </Pressable>
                  <Text style={[styles.checkboxLabel, { color: isDark ? "#f8fafc" : "#374151" }]}>
                    I currently work in this role
                  </Text>
                </View>

                <TextInput
                  label="Description"
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your roles, responsibilities, and achievements..."
                  value={expForm.description}
                  onChangeText={(text) => setExpForm({ ...expForm, description: text })}
                />

                <Pressable onPress={handleSaveExp} style={styles.saveModalBtn}>
                  <Text style={styles.saveModalBtnText}>Save Experience</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Education Add/Edit Modal */}
        <Modal
          visible={showEduModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowEduModal(false);
            resetEduForm();
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
                    {editingEduId ? "Edit Education History" : "Add Education History"}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowEduModal(false);
                      resetEduForm();
                    }}
                  >
                    <MaterialIcons name="close" size={20} color={isDark ? "#cbd5e1" : "#374151"} />
                  </Pressable>
                </View>

                <TextInput
                  label="Institution / School"
                  required
                  placeholder="e.g., IIT Bombay"
                  value={eduForm.institution}
                  onChangeText={(text) => setEduForm({ ...eduForm, institution: text })}
                  error={eduErrors.institution}
                />

                <TextInput
                  label="Degree"
                  required
                  placeholder="e.g., Bachelor of Technology"
                  value={eduForm.degree}
                  onChangeText={(text) => setEduForm({ ...eduForm, degree: text })}
                  error={eduErrors.degree}
                />

                <TextInput
                  label="Field of Study"
                  placeholder="e.g., Computer Science & Engineering"
                  value={eduForm.field}
                  onChangeText={(text) => setEduForm({ ...eduForm, field: text })}
                />

                <TextInput
                  label="Location"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={eduForm.location}
                  onChangeText={(text) => setEduForm({ ...eduForm, location: text })}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <TextInput
                      label="Start Year"
                      placeholder="e.g., 2018"
                      value={eduForm.startYear?.toString()}
                      onChangeText={(text) => setEduForm({ ...eduForm, startYear: text })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="Graduation Year"
                      placeholder="e.g., 2022"
                      value={eduForm.endYear?.toString()}
                      onChangeText={(text) => setEduForm({ ...eduForm, endYear: text })}
                    />
                  </View>
                </View>

                <TextInput
                  label="GPA / Percentage"
                  placeholder="e.g., 9.2/10"
                  value={eduForm.gpa}
                  onChangeText={(text) => setEduForm({ ...eduForm, gpa: text })}
                />

                <Pressable onPress={handleSaveEdu} style={styles.saveModalBtn}>
                  <Text style={styles.saveModalBtnText}>Save Education</Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: "#2563eb",
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
});
