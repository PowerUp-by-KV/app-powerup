/**
 * Preview & Submit Screen - Step 4 of 4
 * Review resume and submit for saving
 */

import { View, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectFormData,
  previousStep,
  setLastSaved,
  setIsSaving,
  resetResume,
} from "@/store/slices/resume.slice";
import { useUpdateResumeMutation } from "@/services/api";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export function PreviewScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectFormData);
  const [updateResume, { isLoading }] = useUpdateResumeMutation();

  const handleSubmit = async () => {
    try {
      dispatch(setIsSaving(true));

      // TODO: Get actual user ID from auth context
      const userId = "current-user-id";

      await updateResume({
        userId,
        data: formData,
      }).unwrap();

      dispatch(setLastSaved(new Date().toLocaleString()));

      Alert.alert("Success", "Resume saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            dispatch(resetResume());
            router.replace("/resume");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save resume. Please try again.");
      console.error(error);
    } finally {
      dispatch(setIsSaving(false));
    }
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

        {/* Preview Content */}
        <View style={styles.formContainer}>
          {/* Contact Section */}
          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>{formData.contact.fullName}</Text>
            <Text style={styles.previewSubtitle}>{formData.contact.email}</Text>
            {formData.contact.phone && (
              <Text style={styles.previewText}>{formData.contact.phone}</Text>
            )}
            {formData.contact.location && (
              <Text style={styles.previewText}>{formData.contact.location}</Text>
            )}
            {formData.contact.linkedin && (
              <Text style={styles.previewText}>{formData.contact.linkedin}</Text>
            )}
          </View>

          {/* Summary Section */}
          {formData.summary?.text && (
            <View style={styles.previewSection}>
              <Text style={styles.previewHeading}>Professional Summary</Text>
              <Text style={styles.previewText}>{formData.summary.text}</Text>
            </View>
          )}

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
                  {exp.description && <Text style={styles.itemDescription}>{exp.description}</Text>}
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

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <MaterialIcons name="check-circle" size={24} color="#10b981" />
              <Text style={styles.summaryCardTitle}>Resume Complete</Text>
            </View>
            <Text style={styles.summaryCardText}>
              Your resume is ready to submit. Click the button below to save your changes.
            </Text>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => dispatch(previousStep())}
              disabled={isLoading}
            >
              <MaterialIcons name="arrow-back" size={20} color="#2563EB" />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <MaterialIcons
                name={isLoading ? "hourglass-empty" : "check"}
                size={20}
                color="white"
              />
              <Text style={styles.primaryButtonText}>
                {isLoading ? "Saving..." : "Save & Submit"}
              </Text>
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
});
