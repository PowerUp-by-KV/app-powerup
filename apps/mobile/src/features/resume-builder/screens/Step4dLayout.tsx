import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { WizardHeader } from "../components/WizardHeader";
import { WizardFooterCTA } from "../components/WizardFooterCTA";
import { LayoutPreviewCard } from "../components/LayoutPreviewCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBuilderDraft, updateLayoutAndTemplate } from "@/store/slices/resume-builder.slice";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface Step4dLayoutProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4dLayout({ onNext, onBack }: Step4dLayoutProps) {
  const dispatch = useAppDispatch();
  const draftResume = useAppSelector(selectBuilderDraft);
  const selectedLayout = draftResume.layout || "single_column";
  const { isDark } = useThemeToggle();

  const handleSelect = (layout: "single_column" | "double_column") => {
    dispatch(updateLayoutAndTemplate({ layout }));
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      <WizardHeader
        title="Choose Your Layout"
        subtitle="Pick a structure that fits your content"
        onBack={onBack}
        currentSubStep={4}
        totalSubSteps={5}
      />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          <LayoutPreviewCard
            label="Two columns"
            type="double"
            isSelected={selectedLayout === "double_column"}
            onPress={() => handleSelect("double_column")}
          />
          <LayoutPreviewCard
            label="One column"
            type="single"
            isSelected={selectedLayout === "single_column"}
            onPress={() => handleSelect("single_column")}
          />
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
