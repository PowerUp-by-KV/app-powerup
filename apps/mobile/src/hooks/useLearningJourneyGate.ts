import { useEffect, useRef, useState } from "react";
import { usePathname } from "expo-router";
import { useGetOnboardingStatusQuery } from "@/services/onboarding-api";
import { useStartSessionMutation } from "@/services/assessment-api";
import { getAuthSession, saveAssessmentSessionId } from "@/services/auth-storage";
import { useGetProfileQuery } from "@/services/auth-api";
import type { StartSessionResponse } from "@/services/assessment-api";

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

  // Assessment session fetched once via startSession POST (resumes existing sessions)
  const [assessmentSession, setAssessmentSession] = useState<StartSessionResponse | null>(null);
  const [assessmentChecked, setAssessmentChecked] = useState(false);
  // Ref guard prevents the effect from firing more than once per userId
  const checkInProgressRef = useRef(false);

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

  const [startSession] = useStartSessionMutation();

  // 2. Fire the assessment check ONCE when shouldCheckAssessment becomes true.
  //    Using a ref guard instead of putting startSession in the dep array
  //    (startSession has an unstable reference that would cause an infinite loop).
  useEffect(() => {
    if (!shouldCheckAssessment || checkInProgressRef.current || assessmentChecked) return;

    checkInProgressRef.current = true;
    startSession()
      .unwrap()
      .then((session) => {
        setAssessmentSession(session);
        if (session.session_id) {
          saveAssessmentSessionId(session.session_id).catch((err) => {
            console.warn("Failed to auto-save session ID in gate:", err);
          });
        }
      })
      .catch((err) => {
        console.warn("Gate: failed to fetch assessment session status:", err);
      })
      .finally(() => {
        setAssessmentChecked(true);
        checkInProgressRef.current = false;
      });
  }, [shouldCheckAssessment, assessmentChecked]); // intentionally omit startSession — its ref is unstable

  // Reset assessment check when the user changes so a new login triggers a fresh check
  useEffect(() => {
    checkInProgressRef.current = false;
    setAssessmentChecked(false);
    setAssessmentSession(null);
  }, [userId]);

  if (
    !isLocalReady ||
    (userId && isProfileLoading) ||
    (userId && isOnboardingLoading) ||
    (shouldCheckAssessment && !assessmentChecked)
  ) {
    return { ready: false, canEnter: false, blockedReason: null };
  }

  // Pre-assessment completion status is determined by:
  // - Populated cefr_range on live user profile (already finished and scored)
  // - Backend session's not_completed_sections list being empty
  let assessmentDone = isCefrDone;
  if (!isCefrDone && assessmentSession) {
    const notCompleted = assessmentSession.not_completed_sections || [];
    assessmentDone = notCompleted.length === 0;
  }

  const canEnter = profileDone && assessmentDone;
  const blockedReason: GateReason = !profileDone
    ? "onboarding"
    : !assessmentDone
      ? "assessment"
      : null;

  return { ready: true, canEnter, blockedReason };
}
