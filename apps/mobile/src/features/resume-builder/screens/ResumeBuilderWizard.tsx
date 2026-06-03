import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLocalSearchParams } from "expo-router";
import {
  selectBuilderCurrentStep,
  hydrateResume,
  setCurrentStep,
  resetBuilderState,
} from "@/store/slices/resume-builder.slice";
import { useGetBuiltResumeQuery } from "@/services/resume-builder-api";
import { StepWizard } from "../components/StepWizard";
import { Step1ContactScreen } from "./Step1ContactScreen";
import { Step2ExperienceScreen } from "./Step2ExperienceScreen";
import { Step3SkillsScreen } from "./Step3SkillsScreen";
import { Step4TemplateScreen } from "./Step4TemplateScreen";
import { Step5PreviewScreen } from "./Step5PreviewScreen";

export function ResumeBuilderWizard() {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectBuilderCurrentStep);
  const { mode } = useLocalSearchParams<{ mode?: "scratch" | "draft" }>();
  const isScratchMode = mode === "scratch";

  // Reset builder state if starting from scratch
  useEffect(() => {
    if (isScratchMode) {
      dispatch(resetBuilderState());
    }
  }, [isScratchMode, dispatch]);

  // Trigger hydration from GET /api/v1/resume-builder (skip if in scratch mode)
  const { data: draft, isLoading } = useGetBuiltResumeQuery(undefined, {
    skip: isScratchMode,
  });

  useEffect(() => {
    if (!isScratchMode && draft) {
      dispatch(hydrateResume(draft));
    }
  }, [draft, isScratchMode, dispatch]);

  // If loading, show standard premium spinner
  if (!isScratchMode && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Hydrating your resume draft...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.wizardContainer}>
          <StepWizard
            currentStep={currentStep}
            onStepChange={(step) => dispatch(setCurrentStep(step))}
          />
        </View>
        <View style={styles.contentContainer}>
          {currentStep === 1 && <Step1ContactScreen />}
          {currentStep === 2 && <Step2ExperienceScreen />}
          {currentStep === 3 && <Step3SkillsScreen />}
          {currentStep === 4 && <Step4TemplateScreen />}
          {currentStep === 5 && <Step5PreviewScreen />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
  },
  wizardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
});
export default ResumeBuilderWizard;
