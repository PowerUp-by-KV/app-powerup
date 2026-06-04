import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateLayoutAndTemplate,
  selectBuilderDraft,
  selectBuilderIsSaving,
  selectBuilderLastSavedAt,
  setCurrentStep,
} from "@/store/slices/resume-builder.slice";
import { TextInput } from "@/features/resume/components/TextInput";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useAutoSave } from "../hooks/useAutoSave";

export function Step4TemplateScreen() {
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const isSaving = useAppSelector(selectBuilderIsSaving);
  const lastSavedAt = useAppSelector(selectBuilderLastSavedAt);

  const selectedTemplate = draftResume.templateName || "harvard";
  const selectedLayout = draftResume.layout || "single_column";
  const occupation = draftResume.occupation || "";
  const experienceLevel = draftResume.experienceLevel || "";

  // Hook up debounced auto-save
  useAutoSave();

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        {/* Step Indicator Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={styles.stepNumber}>Step 4 of 5</Text>
              {isSaving ? (
                <Text style={styles.saveBadge}>Saving...</Text>
              ) : lastSavedAt ? (
                <Text style={styles.savedBadge}>Saved {lastSavedAt}</Text>
              ) : null}
            </View>
            <Text style={styles.headerTitle}>Template & Layout</Text>
            <Text style={styles.headerSubtitle}>Design the presentation of your profile</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          {/* Occupation Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="business-center"
                size={20}
                color="#2563EB"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitle}>Target Occupation</Text>
            </View>

            <TextInput
              label="Target Occupation / Role"
              placeholder="e.g., Lead Product Manager"
              value={occupation}
              onChangeText={(text) => dispatch(updateLayoutAndTemplate({ occupation: text }))}
            />

            <TextInput
              label="Experience Level"
              placeholder="e.g., Mid-Level (3-5 years)"
              value={experienceLevel}
              onChangeText={(text) => dispatch(updateLayoutAndTemplate({ experienceLevel: text }))}
            />
          </View>

          {/* Template Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="dashboard"
                size={20}
                color="#2563EB"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitle}>Select Template</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Choose a structural presentation template</Text>

            <View style={styles.cardsRow}>
              {/* Harvard card */}
              <Pressable
                onPress={() => dispatch(updateLayoutAndTemplate({ templateName: "harvard" }))}
                style={[styles.card, selectedTemplate === "harvard" && styles.activeCard]}
              >
                <View style={styles.cardHeaderIcon}>
                  <Text style={styles.templateIcon}>🎓</Text>
                  {selectedTemplate === "harvard" && (
                    <MaterialIcons name="check-circle" size={18} color="#2563EB" />
                  )}
                </View>
                <Text style={styles.cardTitleText}>Harvard Classic</Text>
                <Text style={styles.cardDescText}>
                  Standard academic and corporate layout. Clean and highly readable.
                </Text>
              </Pressable>

              {/* Modern ATS card */}
              <Pressable
                onPress={() => dispatch(updateLayoutAndTemplate({ templateName: "modern_ats" }))}
                style={[styles.card, selectedTemplate === "modern_ats" && styles.activeCard]}
              >
                <View style={styles.cardHeaderIcon}>
                  <Text style={styles.templateIcon}>🤖</Text>
                  {selectedTemplate === "modern_ats" && (
                    <MaterialIcons name="check-circle" size={18} color="#2563EB" />
                  )}
                </View>
                <Text style={styles.cardTitleText}>Modern ATS Pro</Text>
                <Text style={styles.cardDescText}>
                  Optimized specifically for Applicant Tracking Systems. Sleek and efficient.
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Layout Column Configuration */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="view-column"
                size={20}
                color="#2563EB"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitle}>Column Layout</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Select layout grid distribution</Text>

            <View style={styles.cardsRow}>
              {/* Single Column */}
              <Pressable
                onPress={() => dispatch(updateLayoutAndTemplate({ layout: "single_column" }))}
                style={[styles.card, selectedLayout === "single_column" && styles.activeCard]}
              >
                <View style={styles.cardHeaderIcon}>
                  <Text style={styles.templateIcon}>📄</Text>
                  {selectedLayout === "single_column" && (
                    <MaterialIcons name="check-circle" size={18} color="#2563EB" />
                  )}
                </View>
                <Text style={styles.cardTitleText}>Single Column</Text>
                <Text style={styles.cardDescText}>
                  A traditional, sequential top-to-bottom layout for maximum compatibility.
                </Text>
              </Pressable>

              {/* Double Column */}
              <Pressable
                onPress={() => dispatch(updateLayoutAndTemplate({ layout: "double_column" }))}
                style={[styles.card, selectedLayout === "double_column" && styles.activeCard]}
              >
                <View style={styles.cardHeaderIcon}>
                  <Text style={styles.templateIcon}>📊</Text>
                  {selectedLayout === "double_column" && (
                    <MaterialIcons name="check-circle" size={18} color="#2563EB" />
                  )}
                </View>
                <Text style={styles.cardTitleText}>Double Column</Text>
                <Text style={styles.cardDescText}>
                  Adds a distinct left sidebar for contacts and skills to compress space.
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Navigation Buttons footer */}
          <View style={styles.footerRow}>
            <Pressable onPress={() => dispatch(setCurrentStep(3))} style={styles.backButton}>
              <Feather name="arrow-left" size={16} color="#4b5563" style={{ marginRight: 6 }} />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <Pressable onPress={() => dispatch(setCurrentStep(5))} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next Screen</Text>
              <Feather name="arrow-right" size={16} color="white" style={{ marginLeft: 6 }} />
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
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 12,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
    alignItems: "flex-start",
  },
  activeCard: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  cardHeaderIcon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 6,
  },
  templateIcon: {
    fontSize: 20,
  },
  cardTitleText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  cardDescText: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 13,
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
});
