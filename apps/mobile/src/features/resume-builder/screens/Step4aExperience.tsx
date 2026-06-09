import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text } from "@/components/Themed";
import { WizardHeader } from "../components/WizardHeader";
import { WizardFooterCTA } from "../components/WizardFooterCTA";
import { SelectionPill } from "../components/SelectionPill";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBuilderDraft, updateLayoutAndTemplate } from "@/store/slices/resume-builder.slice";

const EXPERIENCE_LEVELS = [
  "Student",
  "Entry Level",
  "Junior",
  "Mid Level",
  "Senior",
  "Lead",
  "Manager",
  "Director",
];

interface Step4aExperienceProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4aExperience({ onNext, onBack }: Step4aExperienceProps) {
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);

  // Determine if the saved value is a known pill or a custom entry
  const isKnownLevel = EXPERIENCE_LEVELS.includes(draftResume.experienceLevel || "");
  const selectedPill = isKnownLevel ? draftResume.experienceLevel || "" : "";

  // Pre-populate custom input if a custom value is already saved (e.g. after hydration)
  const [customLevel, setCustomLevel] = useState<string>(
    !isKnownLevel ? draftResume.experienceLevel || "" : "",
  );

  const handlePillSelect = (level: string) => {
    setCustomLevel(""); // clear custom input when a pill is chosen
    dispatch(updateLayoutAndTemplate({ experienceLevel: level }));
  };

  const handleCustomChange = (text: string) => {
    setCustomLevel(text);
    // Dispatching the typed value deselects all pills automatically
    // (none of the EXPERIENCE_LEVELS will match a custom string)
    dispatch(updateLayoutAndTemplate({ experienceLevel: text }));
  };

  const canContinue = !!selectedPill || customLevel.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <WizardHeader
        title="How long have you been working?"
        subtitle="We'll find the best templates for your experience level."
        onBack={onBack}
        currentSubStep={1}
        totalSubSteps={5}
      />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Custom text input — at the top */}
        <TextInput
          style={[styles.customInput, customLevel.trim().length > 0 && styles.customInputActive]}
          placeholder="e.g. Solution Architect, Freelancer..."
          placeholderTextColor="#9ca3af"
          value={customLevel}
          onChangeText={handleCustomChange}
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="words"
        />

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>or choose below</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Pill grid */}
        <View style={styles.pillContainer}>
          {EXPERIENCE_LEVELS.map((level) => (
            <SelectionPill
              key={level}
              label={level}
              isSelected={selectedPill === level}
              onPress={() => handlePillSelect(level)}
            />
          ))}
        </View>
      </ScrollView>

      <WizardFooterCTA
        onNext={onNext}
        isNextDisabled={!canContinue}
        onSkip={onBack}
        skipLabel="← Back"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
    marginHorizontal: 12,
  },
  customInput: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontSize: 15,
    color: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  customInputActive: {
    borderColor: "#3b82f6",
    backgroundColor: "white",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.15,
  },
});
