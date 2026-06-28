import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { useThemeToggle } from "@/hooks/useThemeToggle";

export const RESUME_STEPS = {
  1: "CONTACT",
  2: "EXPERIENCE",
  3: "SKILLS",
  4: "TEMPLATE",
  5: "PREVIEW",
} as const;

export const STEP_LABELS = {
  CONTACT: "Contact & Photo",
  EXPERIENCE: "Work & Education",
  SKILLS: "Skills & Projects",
  TEMPLATE: "Layout & Design",
  PREVIEW: "Preview & PDF",
} as const;

interface StepWizardProps {
  currentStep: number;
  totalSteps?: number;
  onStepChange?: (step: number) => void;
}

export function StepWizard({ currentStep, totalSteps = 5, onStepChange }: StepWizardProps) {
  const { isDark } = useThemeToggle();

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const stepKey = stepNumber as keyof typeof RESUME_STEPS;
          const stepName = RESUME_STEPS[stepKey];
          const stepLabel = stepName ? STEP_LABELS[stepName] : "Unknown";
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <View key={stepNumber} style={styles.stepItem}>
              <View style={styles.circleWrapper}>
                <Pressable
                  onPress={() => onStepChange?.(stepNumber)}
                  disabled={stepNumber > currentStep}
                  style={[
                    styles.circle,
                    {
                      backgroundColor: isDark ? "#1f2937" : "white",
                      borderColor: isDark ? "#374151" : "#e5e7eb",
                    },
                    isActive && styles.activeCircle,
                    isCompleted && styles.completedCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      (isActive || isCompleted) && styles.activeCircleText,
                    ]}
                  >
                    {isCompleted ? "✓" : stepNumber}
                  </Text>
                </Pressable>
                {stepNumber < totalSteps && (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: isDark ? "#374151" : "#e5e7eb" },
                      isCompleted && styles.activeLine,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && [styles.activeLabel, { color: isDark ? "#f3f4f6" : "#1f2937" }],
                ]}
              >
                {stepLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 8,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
  },
  circleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    position: "relative",
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activeCircle: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCircle: {
    backgroundColor: "#a3e635",
    borderColor: "#a3e635",
  },
  circleText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#9ca3af",
  },
  activeCircleText: {
    color: "white",
  },
  line: {
    height: 3,
    backgroundColor: "#e5e7eb",
    position: "absolute",
    left: "50%",
    right: "-50%",
    top: 14,
    zIndex: 1,
  },
  activeLine: {
    backgroundColor: "#a3e635",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 2,
  },
  activeLabel: {
    color: "#1f2937",
    fontWeight: "700",
  },
});
