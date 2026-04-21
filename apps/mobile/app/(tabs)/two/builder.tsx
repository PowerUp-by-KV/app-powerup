/**
 * Resume Builder Route (nested under Tab Two)
 * Multi-step form container
 */

import { View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentStep } from "@/store/slices/resume.slice";
import {
  ContactSummaryScreen,
  ExperienceScreen,
  SkillsScreen,
  PreviewScreen,
} from "@/features/resume/screens";

export default function ResumeBuilder() {
  const currentStep = useAppSelector(selectCurrentStep);

  const renderScreen = () => {
    switch (currentStep) {
      case 1:
        return <ContactSummaryScreen />;
      case 2:
        return <ExperienceScreen />;
      case 3:
        return <SkillsScreen />;
      case 4:
        return <PreviewScreen />;
      default:
        return <ContactSummaryScreen />;
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}
