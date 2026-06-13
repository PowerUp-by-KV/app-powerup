import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectCurrentStep,
  nextStep,
  previousStep,
  setCurrentStep,
} from "@/store/slices/resume.slice";
import { StepWizard } from "@/features/resume/components/StepWizard";
import {
  ContactSummaryScreen,
  ExperienceScreen,
  SkillsScreen,
  PreviewScreen,
} from "@/features/resume/screens";

export default function ResumeBuilderRoute() {
  const currentStep = useAppSelector(selectCurrentStep);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <View style={styles.wizardContainer}>
          <StepWizard
            currentStep={currentStep}
            onNextStep={() => dispatch(nextStep())}
            onPreviousStep={() => dispatch(previousStep())}
            onStepChange={(step) => dispatch(setCurrentStep(step))}
          />
        </View>
        <View style={styles.contentContainer}>
          {currentStep === 1 && <ContactSummaryScreen />}
          {currentStep === 2 && <ExperienceScreen />}
          {currentStep === 3 && <SkillsScreen />}
          {currentStep === 4 && <PreviewScreen />}
        </View>
      </View>
    </View>
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
});
