/**
 * Skills Screen - Step 3 of 4
 * Add skills, projects, and certifications
 */

import { View, ScrollView, StyleSheet, Pressable, TextInput as RNTextInput } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSkill,
  removeSkill,
  selectSkills,
  addProject,
  updateProject,
  removeProject,
  selectProjects,
  addCertification,
  updateCertification,
  removeCertification,
  selectCertifications,
  nextStep,
  previousStep,
} from "@/store/slices/resume.slice";
import { TextInput } from "../components";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { Skill, Project, Certification } from "@app-powerup/shared";
import { getSkillSuggestions, skillExists } from "@/utils/skillsAutocomplete";

export function SkillsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const skills = useAppSelector(selectSkills);
  const projects = useAppSelector(selectProjects) || [];
  const certifications = useAppSelector(selectCertifications) || [];

  // Skills state
  const [skillInput, setSkillInput] = useState("");
  const [skillErrors, setSkillErrors] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Projects state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    name: "",
    description: "",
    link: "",
  });
  const [projectTechInput, setProjectTechInput] = useState("");
  const [projectTechs, setProjectTechs] = useState<string[]>([]);

  // Certifications state
  const [certInput, setCertInput] = useState("");

  const handleAddSkill = () => {
    if (!skillInput.trim()) {
      setSkillErrors("Skill name is required");
      return;
    }

    // Check if skill already exists
    if (skills.some((s) => s.name.toLowerCase() === skillInput.toLowerCase())) {
      setSkillErrors("This skill already exists");
      return;
    }

    dispatch(
      addSkill({
        id: Date.now().toString(),
        name: skillInput.trim(),
        category: "",
      }),
    );
    setSkillInput("");
    setSkillErrors("");
    setSkillSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddSuggestionSkill = (suggestion: any) => {
    const skillName = suggestion.name;

    // Check if skill already exists
    if (skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setSkillErrors("This skill already exists");
      return;
    }

    dispatch(
      addSkill({
        id: Date.now().toString(),
        name: skillName,
        category: suggestion.category,
      }),
    );
    setSkillInput("");
    setSkillErrors("");
    setSkillSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRemoveSkill = (id: string) => {
    dispatch(removeSkill(id));
  };

  // --- Project Handlers ---
  const handleSaveProject = () => {
    if (!projectForm.name || !projectForm.name.trim()) return;
    const projData: Project = {
      name: projectForm.name,
      description: projectForm.description,
      link: projectForm.link,
      technologies: projectTechs,
      id: editingProjectId || Date.now().toString(),
    };
    if (editingProjectId) dispatch(updateProject(projData));
    else dispatch(addProject(projData));

    setShowProjectForm(false);
    setEditingProjectId(null);
    setProjectForm({ name: "", description: "", link: "" });
    setProjectTechs([]);
    setProjectTechInput("");
  };

  const handleEditProject = (proj: Project) => {
    setProjectForm(proj);
    setProjectTechs(proj.technologies || []);
    setEditingProjectId(proj.id || proj.name);
    setShowProjectForm(true);
  };

  // --- Certification Handlers ---
  const handleAddCert = () => {
    if (!certInput.trim()) return;
    dispatch(addCertification({ name: certInput.trim(), issuer: "", id: Date.now().toString() }));
    setCertInput("");
  };

  const handleNext = () => {
    if (skills.length === 0) {
      setSkillErrors("Please add at least one skill");
      return;
    }
    dispatch(nextStep());
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.stepNumber}>Step 3 of 4</Text>
            <Text style={styles.headerTitle}>Skills, Projects & Certifications</Text>
            <Text style={styles.headerSubtitle}>Showcase your core competencies and portfolio</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "75%" }]} />
          </View>
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Skills Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="stars" size={24} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Skills</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Add your technical and professional skills</Text>

            {/* Skills List */}
            {skills.length > 0 && (
              <View style={styles.skillsList}>
                {skills.map((skill) => (
                  <View key={skill.id} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill.name}</Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.skillTagRemove,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => handleRemoveSkill(skill.id)}
                    >
                      <MaterialIcons name="close" size={16} color="white" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Skill Input */}
            <View>
              <View style={styles.skillInputContainer}>
                <RNTextInput
                  style={styles.skillInput}
                  placeholder="e.g., React, Python, Project Management..."
                  placeholderTextColor="#9CA3AF"
                  value={skillInput}
                  onChangeText={(text) => {
                    setSkillInput(text);
                    if (skillErrors) setSkillErrors("");

                    // Get suggestions
                    if (text.trim().length > 0) {
                      const suggestions = getSkillSuggestions(text);
                      setSkillSuggestions(suggestions);
                      setShowSuggestions(suggestions.length > 0);
                    } else {
                      setSkillSuggestions([]);
                      setShowSuggestions(false);
                    }
                  }}
                />
                <Pressable
                  style={({ pressed }) => [styles.skillAddButton, pressed && styles.buttonPressed]}
                  onPress={handleAddSkill}
                >
                  <MaterialIcons name="add" size={20} color="white" />
                </Pressable>
              </View>

              {/* Skill Suggestions Dropdown */}
              {showSuggestions && skillSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {skillSuggestions.map((suggestion, index) => (
                    <Pressable
                      key={`${suggestion.id}-${index}`}
                      style={styles.suggestionItem}
                      onPress={() => handleAddSuggestionSkill(suggestion)}
                    >
                      <View style={styles.suggestionContent}>
                        <MaterialIcons
                          name="check-circle-outline"
                          size={16}
                          color="#2563EB"
                          style={{ marginRight: 8 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionText}>{suggestion.name}</Text>
                          <Text style={styles.suggestionCategory}>{suggestion.category}</Text>
                        </View>
                        <MaterialIcons name="arrow-forward" size={16} color="#9ca3af" />
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            {skillErrors ? <Text style={styles.errorText}>{skillErrors}</Text> : null}
          </View>

          {/* Projects Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="folder" size={24} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Highlight key projects and tools used.</Text>

            {projects.length > 0 && (
              <View style={styles.skillsList}>
                {projects.map((proj) => (
                  <View
                    key={proj.id || proj.name}
                    style={[styles.skillTag, { backgroundColor: "#1e40af", paddingVertical: 12 }]}
                  >
                    <View>
                      <Text style={[styles.skillTagText, { fontSize: 15 }]}>{proj.name}</Text>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <Text style={{ color: "#dbeafe", fontSize: 12, marginTop: 2 }}>
                          [{proj.technologies.join(", ")}]
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: "row", gap: 8, marginLeft: 12 }}>
                      <Pressable onPress={() => handleEditProject(proj)}>
                        <MaterialIcons name="edit" size={16} color="white" />
                      </Pressable>
                      <Pressable onPress={() => dispatch(removeProject(proj.id || proj.name))}>
                        <MaterialIcons name="close" size={16} color="#fca5a5" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {showProjectForm ? (
              <View
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <TextInput
                  label="Project Name"
                  required
                  placeholder="e.g. Resume Builder"
                  value={projectForm.name || ""}
                  onChangeText={(text) => setProjectForm({ ...projectForm, name: text })}
                />
                <TextInput
                  label="Description"
                  multiline
                  numberOfLines={2}
                  placeholder="What did you build?"
                  value={projectForm.description || ""}
                  onChangeText={(text) => setProjectForm({ ...projectForm, description: text })}
                />

                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#111827" }}
                  >
                    Technologies Used
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {projectTechs.map((tech, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.skillTag,
                          { backgroundColor: "#64748b", paddingVertical: 4 },
                        ]}
                      >
                        <Text style={styles.skillTagText}>{tech}</Text>
                        <Pressable
                          onPress={() => setProjectTechs(projectTechs.filter((t) => t !== tech))}
                        >
                          <MaterialIcons
                            name="close"
                            size={14}
                            color="white"
                            style={{ marginLeft: 4 }}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <RNTextInput
                      style={styles.skillInput}
                      placeholder="e.g. React, Python"
                      value={projectTechInput}
                      onChangeText={setProjectTechInput}
                      onSubmitEditing={() => {
                        if (
                          projectTechInput.trim() &&
                          !projectTechs.includes(projectTechInput.trim())
                        ) {
                          setProjectTechs([...projectTechs, projectTechInput.trim()]);
                          setProjectTechInput("");
                        }
                      }}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                  <Pressable
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setShowProjectForm(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleSaveProject}
                  >
                    <Text style={styles.primaryButtonText}>
                      {editingProjectId ? "Update" : "Save"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f3f4f6",
                  borderWidth: 2,
                  borderColor: "#2563EB",
                  borderRadius: 8,
                  paddingVertical: 12,
                  gap: 8,
                }}
                onPress={() => {
                  setEditingProjectId(null);
                  setProjectForm({ name: "", description: "" });
                  setProjectTechs([]);
                  setShowProjectForm(true);
                }}
              >
                <MaterialIcons name="add" size={20} color="#2563EB" />
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#2563EB" }}>
                  Add Project
                </Text>
              </Pressable>
            )}
          </View>

          {/* Certifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="verified"
                size={24}
                color="#2563EB"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sectionTitle}>Certifications</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Add professional credentials.</Text>

            {certifications.length > 0 && (
              <View style={styles.skillsList}>
                {certifications.map((cert) => (
                  <View
                    key={cert.id || cert.name}
                    style={[styles.skillTag, { backgroundColor: "#047857" }]}
                  >
                    <Text style={styles.skillTagText}>{cert.name}</Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.skillTagRemove,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => dispatch(removeCertification(cert.id || cert.name))}
                    >
                      <MaterialIcons name="close" size={16} color="white" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.skillInputContainer}>
              <RNTextInput
                style={styles.skillInput}
                placeholder="e.g. AWS Certified Solutions Architect"
                placeholderTextColor="#9CA3AF"
                value={certInput}
                onChangeText={setCertInput}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.skillAddButton,
                  pressed && styles.buttonPressed,
                  { backgroundColor: "#047857" },
                ]}
                onPress={handleAddCert}
              >
                <MaterialIcons name="add" size={20} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Summary Section */}
          {(skills.length > 0 || projects.length > 0 || certifications.length > 0) && (
            <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                <MaterialIcons name="check-circle" size={24} color="#10b981" />
                <Text style={styles.summaryTitle}>Added Items</Text>
              </View>
              <Text style={styles.summaryText}>
                You've configured {skills.length} skills, {projects.length} projects, and{" "}
                {certifications.length} certifications. Great job!
              </Text>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => dispatch(previousStep())}
            >
              <MaterialIcons name="arrow-back" size={20} color="#2563EB" />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
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
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  skillTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  skillTagText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  skillTagRemove: {
    padding: 2,
  },
  skillInputContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  skillInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  skillAddButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 6,
  },
  summarySection: {
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 16,
    marginBottom: 28,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  summaryText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 34,
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
  // Skill suggestions styles
  suggestionsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 4,
    overflow: "hidden",
    maxHeight: 280,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  suggestionCategory: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
});
