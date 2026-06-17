import { useEffect, useState } from "react";
import { usePathname } from "expo-router";
import { useGetOnboardingStatusQuery } from "@/services/onboarding-api";
import { useCheckAssessmentStatusQuery } from "@/services/assessment-api";
import {
  getAuthSession,
  saveAssessmentSessionId,
  syncCompletedSections,
  getProfileCompletedInSession,
  getPreAssessmentCompletedInSession,
  setProfileCompletedInSession,
  setPreAssessmentCompletedInSession,
} from "@/services/auth-storage";
import { useGetProfileQuery } from "@/services/auth-api";

export type GateReason = "onboarding" | "assessment" | null;

export interface LearningJourneyGate {
  ready: boolean;
  canEnter: boolean;
  blockedReason: GateReason;
  completedSections: string[];
  notCompletedSections: string[];
}

export function useLearningJourneyGate(): LearningJourneyGate {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLocalReady, setIsLocalReady] = useState(false);

  const [localProfileDone, setLocalProfileDone] = useState(false);
  const [localAssessmentDone, setLocalAssessmentDone] = useState(false);

  useEffect(() => {
    const loadLocal = async () => {
      try {
        const session = await getAuthSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
        } else {
          setUserId(null);
        }

        const pDone = await getProfileCompletedInSession();
        const aDone = await getPreAssessmentCompletedInSession();
        setLocalProfileDone(pDone);
        setLocalAssessmentDone(aDone);
      } catch (err) {
        console.warn("Failed to load local session in gate:", err);
      } finally {
        setIsLocalReady(true);
      }
    };
    loadLocal();
  }, [pathname]);

  // Fetch live user profile dynamically from the backend
  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
    skip: !userId,
  });

  // 1. Authoritatively check Onboarding status from backend endpoint
  const { data: onboardingStatus, isLoading: isOnboardingLoading } = useGetOnboardingStatusQuery(
    userId ?? "",
    {
      skip: !userId || localProfileDone,
    },
  );

  // profileDone only requires answers_present — resume upload is optional
  const isCefrDone = !!profile?.cefr_range;
  const profileDone = localProfileDone || (onboardingStatus?.answers_present ?? false);

  useEffect(() => {
    if (profileDone && !localProfileDone) {
      setLocalProfileDone(true);
      setProfileCompletedInSession(true).catch((err) =>
        console.warn("Failed to save profile completion:", err),
      );
    }
  }, [profileDone, localProfileDone]);

  const shouldCheckAssessment = !!userId && profileDone && !isCefrDone && !localAssessmentDone;

  // 2. Authoritatively query the assessment status from the backend
  const { data: assessmentSession, isLoading: isAssessmentLoading } = useCheckAssessmentStatusQuery(
    undefined,
    {
      skip: !shouldCheckAssessment,
    },
  );

  // Auto-save session ID and sync completed sections when fetched successfully
  useEffect(() => {
    if (assessmentSession) {
      const syncData = async () => {
        try {
          if (assessmentSession.session_id) {
            await saveAssessmentSessionId(assessmentSession.session_id);
          }
          if (assessmentSession.completed_sections) {
            await syncCompletedSections(assessmentSession.completed_sections);
          }
        } catch (err) {
          console.warn("Failed to sync assessment data in gate:", err);
        }
      };
      syncData();
    }
  }, [assessmentSession]);

  // Pre-assessment completion status is determined by:
  // - Populated cefr_range on live user profile (already finished and scored)
  // - Backend session having completed sections AND no sections left to complete
  let assessmentDone = localAssessmentDone || isCefrDone;
  const completed = assessmentSession?.completed_sections || [];
  const notCompleted = assessmentSession?.not_completed_sections || [];
  if (!assessmentDone && assessmentSession) {
    assessmentDone = completed.length > 0 && notCompleted.length === 0;
  }

  useEffect(() => {
    if (assessmentDone && !localAssessmentDone) {
      setLocalAssessmentDone(true);
      setPreAssessmentCompletedInSession(true).catch((err) =>
        console.warn("Failed to save assessment completion:", err),
      );
    }
  }, [assessmentDone, localAssessmentDone]);

  if (
    !isLocalReady ||
    (userId && isProfileLoading) ||
    (userId && !localProfileDone && isOnboardingLoading) ||
    (shouldCheckAssessment && isAssessmentLoading)
  ) {
    return {
      ready: false,
      canEnter: false,
      blockedReason: null,
      completedSections: [],
      notCompletedSections: [],
    };
  }

  const canEnter = profileDone && assessmentDone;
  const blockedReason: GateReason = !profileDone
    ? "onboarding"
    : !assessmentDone
      ? "assessment"
      : null;

  return {
    ready: true,
    canEnter,
    blockedReason,
    completedSections: completed,
    notCompletedSections: notCompleted,
  };
}
