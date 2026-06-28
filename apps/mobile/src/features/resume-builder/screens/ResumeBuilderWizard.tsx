import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
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
import { Step4OnboardingFlow } from "./Step4OnboardingFlow";
import { Step5PreviewScreen } from "./Step5PreviewScreen";
import { useThemeToggle } from "@/hooks/useThemeToggle";

export function ResumeBuilderWizard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentStep = useAppSelector(selectBuilderCurrentStep);
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();
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
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={[styles.loadingText, { color: isDark ? "#d1d5db" : "#4b5563" }]}>
          Hydrating your resume draft...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: isDark ? "#0f172a" : "#f3f4f6",
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: isDark ? "#1e293b" : "white" }]}
          >
            <Feather name="arrow-left" size={20} color={isDark ? "#e2e8f0" : "#374151"} />
          </Pressable>
        </View>
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
          {currentStep === 4 && <Step4OnboardingFlow />}
          {currentStep === 5 && <Step5PreviewScreen />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wizardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
});
export default ResumeBuilderWizard;
