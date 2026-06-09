import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "@/components/Themed";
import { WizardHeader } from "../components/WizardHeader";
import { WizardFooterCTA } from "../components/WizardFooterCTA";
import { SelectionListCard } from "../components/SelectionListCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBuilderDraft, updateLayoutAndTemplate } from "@/store/slices/resume-builder.slice";
import { OCCUPATION_OPTIONS } from "../constants";

interface Step4bOccupationProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4bOccupation({ onNext, onBack }: Step4bOccupationProps) {
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);

  // Detect if the saved value is a known option or a custom entry
  const isCustomOccupation =
    !!draftResume.occupation && !OCCUPATION_OPTIONS.includes(draftResume.occupation);
  const selectedCard = isCustomOccupation ? "" : draftResume.occupation || "";

  // Pre-populate custom input if a custom value is already saved (handles hydration)
  const [customOccupation, setCustomOccupation] = useState<string>(
    isCustomOccupation ? draftResume.occupation || "" : "",
  );

  const handleCardSelect = (occupation: string) => {
    setCustomOccupation(""); // clear custom input when a card is chosen
    dispatch(updateLayoutAndTemplate({ occupation }));
  };

  const handleCustomChange = (text: string) => {
    setCustomOccupation(text);
    // Dispatching the typed value deselects all cards automatically
    dispatch(updateLayoutAndTemplate({ occupation: text }));
  };

  const canContinue = !!selectedCard || customOccupation.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <WizardHeader
        title="What is your occupation?"
        subtitle="We'll find the best templates for your role."
        onBack={onBack}
        currentSubStep={2}
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
          style={[
            styles.customInput,
            customOccupation.trim().length > 0 && styles.customInputActive,
          ]}
          placeholder="e.g. Solution Architect, Consultant..."
          placeholderTextColor="#9ca3af"
          value={customOccupation}
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

        {/* Existing card list */}
        {OCCUPATION_OPTIONS.map((occupation) => (
          <SelectionListCard
            key={occupation}
            label={occupation}
            isSelected={selectedCard === occupation}
            onPress={() => handleCardSelect(occupation)}
          />
        ))}
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
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
