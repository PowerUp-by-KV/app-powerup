import { useState } from "react";

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  return {
    currentStep,
    setCurrentStep,
  };
}
