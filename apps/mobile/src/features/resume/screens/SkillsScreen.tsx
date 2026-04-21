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
  nextStep,
  previousStep,
} from "@/store/slices/resume.slice";
import { TextInput } from "../components";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { Skill } from "@app-powerup/shared";

export function SkillsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const skills = useAppSelector(selectSkills);

  // Skills state
  const [skillInput, setSkillInput] = useState("");
  const [skillErrors, setSkillErrors] = useState("");

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
  };

  const handleRemoveSkill = (id: string) => {
    dispatch(removeSkill(id));
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
            <Text style={styles.headerTitle}>Skills & Expertise</Text>
            <Text style={styles.headerSubtitle}>Showcase your professional skills</Text>
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
            <View style={styles.skillInputContainer}>
              <RNTextInput
                style={styles.skillInput}
                placeholder="e.g., React, Python, Project Management..."
                placeholderTextColor="#9CA3AF"
                value={skillInput}
                onChangeText={(text) => {
                  setSkillInput(text);
                  if (skillErrors) setSkillErrors("");
                }}
              />
              <Pressable
                style={({ pressed }) => [styles.skillAddButton, pressed && styles.buttonPressed]}
                onPress={handleAddSkill}
              >
                <MaterialIcons name="add" size={20} color="white" />
              </Pressable>
            </View>
            {skillErrors && <Text style={styles.errorText}>{skillErrors}</Text>}
          </View>

          {/* Skills Summary */}
          {skills.length > 0 && (
            <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                <MaterialIcons name="check-circle" size={24} color="#10b981" />
                <Text style={styles.summaryTitle}>Skills Added</Text>
              </View>
              <Text style={styles.summaryText}>
                You've added {skills.length} skill{skills.length !== 1 ? "s" : ""}. Great job!
                You're almost done.
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
});
