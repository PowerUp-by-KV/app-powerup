import { useEffect, useState } from "react";
import { usePathname } from "expo-router";
import { useGetOnboardingStatusQuery } from "@/services/onboarding-api";
import { useCheckAssessmentStatusQuery } from "@/services/assessment-api";
import { getAuthSession, saveAssessmentSessionId } from "@/services/auth-storage";
import { useGetProfileQuery } from "@/services/auth-api";

export type GateReason = "onboarding" | "assessment" | null;

export interface LearningJourneyGate {
  ready: boolean;
  canEnter: boolean;
  blockedReason: GateReason;
}

export function useLearningJourneyGate(): LearningJourneyGate {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLocalReady, setIsLocalReady] = useState(false);

  useEffect(() => {
    const loadLocal = async () => {
      try {
        const session = await getAuthSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
        } else {
          setUserId(null);
        }
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
      skip: !userId,
    },
  );

  // profileDone only requires answers_present — resume upload is optional
  const isCefrDone = !!profile?.cefr_range;
  const profileDone = onboardingStatus?.answers_present ?? false;

  const shouldCheckAssessment = !!userId && profileDone && !isCefrDone;

  // 2. Authoritatively query the assessment status from the backend
  const { data: assessmentSession, isLoading: isAssessmentLoading } = useCheckAssessmentStatusQuery(
    undefined,
    {
      skip: !shouldCheckAssessment,
    },
  );

  // Auto-save session ID when fetched successfully
  useEffect(() => {
    if (assessmentSession?.session_id) {
      saveAssessmentSessionId(assessmentSession.session_id).catch((err) => {
        console.warn("Failed to auto-save session ID in gate:", err);
      });
    }
  }, [assessmentSession?.session_id]);

  if (
    !isLocalReady ||
    (userId && isProfileLoading) ||
    (userId && isOnboardingLoading) ||
    (shouldCheckAssessment && isAssessmentLoading)
  ) {
    return { ready: false, canEnter: false, blockedReason: null };
  }

  // Pre-assessment completion status is determined by:
  // - Populated cefr_range on live user profile (already finished and scored)
  // - Backend session has no remaining sections AND at least one completed section
  //   (empty not_completed alone is not enough — a brand-new session also returns [] for both)
  let assessmentDone = isCefrDone;
  if (!isCefrDone && assessmentSession) {
    const notCompleted = assessmentSession.not_completed_sections || [];
    const completed = assessmentSession.completed_sections || [];
    assessmentDone = notCompleted.length === 0 && completed.length > 0;
  }

  const canEnter = profileDone && assessmentDone;
  const blockedReason: GateReason = !profileDone
    ? "onboarding"
    : !assessmentDone
      ? "assessment"
      : null;

  return { ready: true, canEnter, blockedReason };
}
