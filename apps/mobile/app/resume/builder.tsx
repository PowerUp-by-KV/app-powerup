/**
 * Resume Builder Route
 * Multi-step form container - routes to correct step screen
 */

import { View } from "react-native";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectCurrentStep, loadResumeData } from "@/store/slices/resume.slice";
import { useGetResumeQuery } from "@/services/resume-api";
import {
  ContactSummaryScreen,
  ExperienceScreen,
  SkillsScreen,
  PreviewScreen,
} from "@/features/resume/screens";

export default function ResumeBuilder() {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectCurrentStep);

  // TODO: Get actual userId from auth context or secure storage.
  // Until auth is implemented, do not issue the resume request.
  const userId: string | null = null;
  const { data: resumeData } = useGetResumeQuery(userId ?? "", {
    skip: !userId,
  });

  useEffect(() => {
    if (resumeData) {
      // Response is already in ResumeParsedData structure (flat, not nested)
      dispatch(loadResumeData(resumeData as any));
    }
  }, [resumeData, dispatch]);

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
