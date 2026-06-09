import React from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBuilderCurrentSubStep,
  setCurrentSubStep,
  setCurrentStep,
} from "@/store/slices/resume-builder.slice";
import { Step4aExperience } from "./Step4aExperience";
import { Step4bOccupation } from "./Step4bOccupation";
import { Step4cPhoto } from "./Step4cPhoto";
import { Step4dLayout } from "./Step4dLayout";
import { Step4eTemplate } from "./Step4eTemplate";
import { useAutoSave } from "../hooks/useAutoSave";

export function Step4OnboardingFlow() {
  const dispatch = useAppDispatch();
  const currentSubStep = useAppSelector(selectBuilderCurrentSubStep);

  // Mount the autosave hook exactly once at the top of the onboarding flow
  // This safely debounces any Redux changes made in the sub-screens.
  useAutoSave();

  // 4a Experience
  if (currentSubStep === 0) {
    return (
      <Step4aExperience
        onNext={() => dispatch(setCurrentSubStep(1))}
        onBack={() => dispatch(setCurrentStep(3))}
      />
    );
  }

  // 4b Occupation
  if (currentSubStep === 1) {
    return (
      <Step4bOccupation
        onNext={() => dispatch(setCurrentSubStep(2))}
        onBack={() => dispatch(setCurrentSubStep(0))}
      />
    );
  }

  // 4c Photo
  if (currentSubStep === 2) {
    return (
      <Step4cPhoto
        onNext={() => dispatch(setCurrentSubStep(3))}
        onBack={() => dispatch(setCurrentSubStep(1))}
      />
    );
  }

  // 4d Layout
  if (currentSubStep === 3) {
    return (
      <Step4dLayout
        onNext={() => dispatch(setCurrentSubStep(4))}
        onBack={() => dispatch(setCurrentSubStep(2))}
      />
    );
  }

  // 4e Template
  if (currentSubStep === 4) {
    return (
      <Step4eTemplate
        onNext={() => dispatch(setCurrentStep(5))}
        onBack={() => dispatch(setCurrentSubStep(3))}
      />
    );
  }

  return null;
}
