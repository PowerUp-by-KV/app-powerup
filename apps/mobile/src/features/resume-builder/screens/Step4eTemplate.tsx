import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { WizardHeader } from "../components/WizardHeader";
import { WizardFooterCTA } from "../components/WizardFooterCTA";
import { TemplatePreviewCard } from "../components/TemplatePreviewCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBuilderDraft, updateLayoutAndTemplate } from "@/store/slices/resume-builder.slice";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface Step4eTemplateProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4eTemplate({ onNext, onBack }: Step4eTemplateProps) {
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const selectedTemplate = draftResume.templateName || "harvard";
  const { isDark } = useThemeToggle();

  const handleSelect = (templateName: "harvard" | "modern_ats") => {
    dispatch(updateLayoutAndTemplate({ templateName }));
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      <WizardHeader
        title="Pick Your Style"
        subtitle="Multiple selections allowed"
        onBack={onBack}
        currentSubStep={5}
        totalSubSteps={5}
      />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TemplatePreviewCard
          title="Simple & Classic"
          subtitle="Perfect for corporate & traditional roles"
          icon="📄"
          isSelected={selectedTemplate === "harvard"}
          onPress={() => handleSelect("harvard")}
        />

        <TemplatePreviewCard
          title="Modern & Subtle"
          subtitle="Ideal for tech, startups & innovative fields"
          icon="💼"
          isSelected={selectedTemplate === "modern_ats"}
          onPress={() => handleSelect("modern_ats")}
        />
      </ScrollView>

      <WizardFooterCTA onNext={onNext} onSkip={onBack} skipLabel="← Back" />
    </View>
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
    paddingBottom: 120, // Leave room for absolute footer
  },
});
