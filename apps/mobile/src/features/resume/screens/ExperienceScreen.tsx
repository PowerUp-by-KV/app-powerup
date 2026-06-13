/**
 * Experience & Education Screen - Step 2 of 4
 * Collect work experience and educational background
 */

import { View, ScrollView, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  selectExperience,
  selectEducation,
  nextStep,
  previousStep,
} from "@/store/slices/resume.slice";
import { TextInput } from "../components";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { Experience, Education } from "@/services/resume-api";

const createResumeItemId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export function ExperienceScreen() {
  const dispatch = useAppDispatch();
  const experience = useAppSelector(selectExperience) || [];
  const education = useAppSelector(selectEducation) || [];

  // Experience form state
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [experienceForm, setExperienceForm] = useState<Partial<Experience>>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
  });
  const [experienceErrors, setExperienceErrors] = useState<Record<string, string>>({});

  // Education form state
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [educationForm, setEducationForm] = useState<Partial<Education>>({
    school: "",
    degree: "",
    field: "",
    graduationDate: "",
  });
  const [educationErrors, setEducationErrors] = useState<Record<string, string>>({});

  // Experience handlers
  const validateExperienceForm = () => {
    const errors: Record<string, string> = {};
    if (!experienceForm.company?.trim()) errors.company = "Company is required";
    if (!experienceForm.position?.trim()) errors.position = "Position is required";
    if (!experienceForm.startDate?.trim()) errors.startDate = "Start date is required";
    if (!experienceForm.currentlyWorking && !experienceForm.endDate?.trim()) {
      errors.endDate = "End date is required or mark as currently working";
    }
    setExperienceErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddExperience = () => {
    if (validateExperienceForm()) {
      if (editingExperienceId) {
        dispatch(updateExperience({ ...experienceForm, id: editingExperienceId } as Experience));
        setEditingExperienceId(null);
      } else {
        dispatch(
          addExperience({
            ...experienceForm,
            id: createResumeItemId(),
          } as Experience),
        );
      }
      setExperienceForm({
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
      });
      setShowExperienceForm(false);
      setExperienceErrors({});
    }
  };

  const handleEditExperience = (exp: Experience) => {
    setExperienceForm(exp);
    setEditingExperienceId(exp.id);
    setShowExperienceForm(true);
  };

  const handleCancelExperienceForm = () => {
    setShowExperienceForm(false);
    setEditingExperienceId(null);
    setExperienceForm({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    });
    setExperienceErrors({});
  };

  // Education handlers
  const validateEducationForm = () => {
    const errors: Record<string, string> = {};
    if (!educationForm.school?.trim()) errors.school = "School/University is required";
    if (!educationForm.degree?.trim()) errors.degree = "Degree is required";
    if (!educationForm.field?.trim()) errors.field = "Field of study is required";
    if (!educationForm.graduationDate?.trim())
      errors.graduationDate = "Graduation date is required";
    setEducationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEducation = () => {
    if (validateEducationForm()) {
      if (editingEducationId) {
        dispatch(updateEducation({ ...educationForm, id: editingEducationId } as Education));
        setEditingEducationId(null);
      } else {
        dispatch(
          addEducation({
            ...educationForm,
            id: createResumeItemId(),
          } as Education),
        );
      }
      setEducationForm({
        school: "",
        degree: "",
        field: "",
        graduationDate: "",
      });
      setShowEducationForm(false);
      setEducationErrors({});
    }
  };

  const handleEditEducation = (edu: Education) => {
    setEducationForm(edu);
    setEditingEducationId(edu.id);
    setShowEducationForm(true);
  };

  const handleCancelEducationForm = () => {
    setShowEducationForm(false);
    setEditingEducationId(null);
    setEducationForm({
      school: "",
      degree: "",
      field: "",
      graduationDate: "",
    });
    setEducationErrors({});
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.stepNumber}>Step 2 of 4</Text>
            <Text style={styles.headerTitle}>Experience & Education</Text>
            <Text style={styles.headerSubtitle}>Tell us about your background</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "50%" }]} />
          </View>
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Experience Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="work" size={24} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Experience</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Add your work experience</Text>

            {/* Experience List */}
            {experience.length > 0 && (
              <View style={styles.itemsList}>
                {experience.map((exp) => (
                  <View key={exp.id} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{exp.position}</Text>
                      <Text style={styles.listItemSubtitle}>{exp.company}</Text>
                      <Text style={styles.listItemDate}>
                        {exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate}
                      </Text>
                    </View>
                    <View style={styles.listItemActions}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.iconButton]}
                        onPress={() => handleEditExperience(exp)}
                      >
                        <MaterialIcons name="edit" size={18} color="#2563EB" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.iconButton]}
                        onPress={() => dispatch(removeExperience(exp.id))}
                      >
                        <MaterialIcons name="delete" size={18} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Add Experience Form */}
            {showExperienceForm ? (
              <View style={styles.form}>
                <TextInput
                  label="Company"
                  required
                  placeholder="e.g. Acme Corp"
                  value={experienceForm.company || ""}
                  onChangeText={(text) => {
                    setExperienceForm({ ...experienceForm, company: text });
                    if (experienceErrors.company)
                      setExperienceErrors({ ...experienceErrors, company: "" });
                  }}
                  error={experienceErrors.company}
                />
                <TextInput
                  label="Position"
                  required
                  placeholder="e.g. Senior Developer"
                  value={experienceForm.position || ""}
                  onChangeText={(text) => {
                    setExperienceForm({ ...experienceForm, position: text });
                    if (experienceErrors.position)
                      setExperienceErrors({ ...experienceErrors, position: "" });
                  }}
                  error={experienceErrors.position}
                />
                <TextInput
                  label="Start Date"
                  required
                  placeholder="MM/YYYY"
                  value={experienceForm.startDate || ""}
                  onChangeText={(text) => {
                    setExperienceForm({ ...experienceForm, startDate: text });
                    if (experienceErrors.startDate)
                      setExperienceErrors({ ...experienceErrors, startDate: "" });
                  }}
                  error={experienceErrors.startDate}
                />

                {/* Currently Working Switch */}
                <View style={styles.switchContainer}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                    Currently Working Here
                  </Text>
                  <Switch
                    value={experienceForm.currentlyWorking || false}
                    onValueChange={(value) =>
                      setExperienceForm({ ...experienceForm, currentlyWorking: value })
                    }
                  />
                </View>

                {!experienceForm.currentlyWorking && (
                  <TextInput
                    label="End Date"
                    required={!experienceForm.currentlyWorking}
                    placeholder="MM/YYYY"
                    value={experienceForm.endDate || ""}
                    onChangeText={(text) => {
                      setExperienceForm({ ...experienceForm, endDate: text });
                      if (experienceErrors.endDate)
                        setExperienceErrors({ ...experienceErrors, endDate: "" });
                    }}
                    error={experienceErrors.endDate}
                  />
                )}

                <TextInput
                  label="Description"
                  multiline
                  numberOfLines={3}
                  placeholder="Describe your responsibilities and achievements"
                  value={experienceForm.description || ""}
                  onChangeText={(text) =>
                    setExperienceForm({ ...experienceForm, description: text })
                  }
                />

                <View style={styles.formButtonContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleCancelExperienceForm}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleAddExperience}
                  >
                    <Text style={styles.primaryButtonText}>
                      {editingExperienceId ? "Update" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.addButton]}
                onPress={() => setShowExperienceForm(true)}
              >
                <MaterialIcons name="add" size={20} color="#2563EB" />
                <Text style={styles.addButtonText}>Add Experience</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Education Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="school" size={24} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Education</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Add your educational qualifications</Text>

            {/* Education List */}
            {education.length > 0 && (
              <View style={styles.itemsList}>
                {education.map((edu) => (
                  <View key={edu.id} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{edu.degree}</Text>
                      <Text style={styles.listItemSubtitle}>{edu.school}</Text>
                      <Text style={styles.listItemDate}>{edu.field}</Text>
                    </View>
                    <View style={styles.listItemActions}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.iconButton]}
                        onPress={() => handleEditEducation(edu)}
                      >
                        <MaterialIcons name="edit" size={18} color="#2563EB" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.iconButton]}
                        onPress={() => dispatch(removeEducation(edu.id))}
                      >
                        <MaterialIcons name="delete" size={18} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Add Education Form */}
            {showEducationForm ? (
              <View style={styles.form}>
                <TextInput
                  label="School/University"
                  required
                  placeholder="e.g. MIT"
                  value={educationForm.school || ""}
                  onChangeText={(text) => {
                    setEducationForm({ ...educationForm, school: text });
                    if (educationErrors.school)
                      setEducationErrors({ ...educationErrors, school: "" });
                  }}
                  error={educationErrors.school}
                />
                <TextInput
                  label="Degree"
                  required
                  placeholder="e.g. Bachelor of Science"
                  value={educationForm.degree || ""}
                  onChangeText={(text) => {
                    setEducationForm({ ...educationForm, degree: text });
                    if (educationErrors.degree)
                      setEducationErrors({ ...educationErrors, degree: "" });
                  }}
                  error={educationErrors.degree}
                />
                <TextInput
                  label="Field of Study"
                  required
                  placeholder="e.g. Computer Science"
                  value={educationForm.field || ""}
                  onChangeText={(text) => {
                    setEducationForm({ ...educationForm, field: text });
                    if (educationErrors.field)
                      setEducationErrors({ ...educationErrors, field: "" });
                  }}
                  error={educationErrors.field}
                />
                <TextInput
                  label="Graduation Date"
                  required
                  placeholder="MM/YYYY"
                  value={educationForm.graduationDate || ""}
                  onChangeText={(text) => {
                    setEducationForm({ ...educationForm, graduationDate: text });
                    if (educationErrors.graduationDate)
                      setEducationErrors({ ...educationErrors, graduationDate: "" });
                  }}
                  error={educationErrors.graduationDate}
                />

                <View style={styles.formButtonContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleCancelEducationForm}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleAddEducation}
                  >
                    <Text style={styles.primaryButtonText}>
                      {editingEducationId ? "Update" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.addButton]}
                onPress={() => setShowEducationForm(true)}
              >
                <MaterialIcons name="add" size={20} color="#2563EB" />
                <Text style={styles.addButtonText}>Add Education</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.button, styles.secondaryButton]}
              onPress={() => dispatch(previousStep())}
            >
              <MaterialIcons name="arrow-back" size={20} color="#2563EB" />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.button, styles.primaryButton]}
              onPress={() => dispatch(nextStep())}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
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
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    marginLeft: 34,
  },
  itemsList: {
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  listItemDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  listItemActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  iconButton: {
    padding: 8,
  },
  form: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  formButtonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
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
});
