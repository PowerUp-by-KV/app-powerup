/**
 * StepWizard Component - Multi-step form progress indicator
 * Shows current step with dots and labels
 */

import { View, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { Button } from "./Button";
import { STEP_LABELS, RESUME_STEPS } from "@app-powerup/shared";

interface StepWizardProps {
  currentStep: number;
  totalSteps?: number;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
  onStepChange?: (step: number) => void;
  isLoading?: boolean;
  showLabels?: boolean;
}

export function StepWizard({
  currentStep,
  totalSteps = 4,
  onNextStep,
  onPreviousStep,
  onStepChange,
  isLoading = false,
  showLabels = true,
}: StepWizardProps) {
  return (
    <View className="space-y-4">
      {/* Step Dots & Labels */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between px-4">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const stepKey = stepNumber as keyof typeof RESUME_STEPS;
            const stepLabel = RESUME_STEPS[stepKey]
              ? STEP_LABELS[RESUME_STEPS[stepKey]]
              : "Unknown";
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <View key={stepNumber} className="flex-1 items-center">
                {/* Dot */}
                <Pressable
                  onPress={() => onStepChange?.(stepNumber)}
                  disabled={stepNumber > currentStep}
                  className={`mb-2 h-10 w-10 items-center justify-center rounded-full ${
                    isActive ? "bg-blue-600" : isCompleted ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      isActive || isCompleted ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {isCompleted ? "✓" : stepNumber}
                  </Text>
                </Pressable>

                {/* Label */}
                {showLabels && (
                  <Text
                    className={`text-center text-xs font-medium ${
                      isActive ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {stepLabel}
                  </Text>
                )}

                {/* Line Connector */}
                {stepNumber < totalSteps && (
                  <View
                    className={`absolute top-5 h-1 w-full ${
                      isCompleted ? "bg-green-600" : "bg-gray-300"
                    }`}
                    style={{ left: "50%", width: "200%" }}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            variant="secondary"
            size="md"
            onPress={onPreviousStep}
            disabled={currentStep === 1 || isLoading}
          >
            Previous
          </Button>
        </View>

        <View className="flex-1">
          <Button
            size="md"
            onPress={onNextStep}
            isLoading={isLoading}
            disabled={currentStep === totalSteps || isLoading}
          >
            Next
          </Button>
        </View>
      </View>

      {/* Step Counter */}
      <View className="items-center">
        <Text className="text-xs text-gray-600">
          Step {currentStep} of {totalSteps}
        </Text>
      </View>
    </View>
  );
}
