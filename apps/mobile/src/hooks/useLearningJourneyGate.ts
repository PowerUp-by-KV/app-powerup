import { useEffect, useState } from "react";
import { usePathname } from "expo-router";
import { useGetOnboardingStatusQuery } from "@/services/onboarding-api";
import { useStartSessionMutation } from "@/services/assessment-api";
import {
  getAuthSession,
  saveAssessmentSessionId,
  getAssessmentSessionId,
} from "@/services/auth-storage";
import { useGetProfileQuery } from "@/services/auth-api";

export type GateReason = "onboarding" | "assessment" | null;

export interface LearningJourneyGate {
  ready: boolean;
  canEnter: boolean;
  blockedReason: GateReason;
  session_id?: string | null;
}

export function useLearningJourneyGate(): LearningJourneyGate {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [localSessionId, setLocalSessionId] = useState<string | null>(null);
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
        const savedId = await getAssessmentSessionId();
        if (savedId) {
          setLocalSessionId(savedId);
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

  const [assessmentAlreadyCompleted, setAssessmentAlreadyCompleted] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [startSession] = useStartSessionMutation();

  // profileDone only requires answers_present — resume upload is optional
  const isCefrDone = !!profile?.cefr_range;
  const profileDone = onboardingStatus?.answers_present ?? false;

  // Query session status from session/start endpoint manually inside useEffect
  useEffect(() => {
    if (!userId || !profileDone) return;

    // Only skip if we already have the localSessionId in cache
    if (isCefrDone && localSessionId) {
      setAssessmentAlreadyCompleted(true);
      return;
    }

    const checkStatus = async () => {
      setAssessmentLoading(true);
      try {
        const response = await startSession().unwrap();
        if (response.session_id) {
          setLocalSessionId(response.session_id);
          await saveAssessmentSessionId(response.session_id);
        }
      } catch (err: any) {
        const errData = err?.data;
        const detailText = errData?.detail || errData?.message || "";
        if (
          detailText.toLowerCase().includes("already completed") ||
          detailText.toLowerCase().includes("already started") ||
          err?.status === 400
        ) {
          setAssessmentAlreadyCompleted(true);

          // Ultra-robust regex to extract any UUID session_id from error responses
          const responseString = JSON.stringify(errData || err || "");
          const uuidMatch = responseString.match(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
          );
          const extractedId =
            errData?.session_id || errData?.detail?.session_id || (uuidMatch ? uuidMatch[0] : null);

          if (extractedId) {
            setLocalSessionId(extractedId);
            await saveAssessmentSessionId(extractedId);
          }
        }
      } finally {
        setAssessmentLoading(false);
      }
    };

    checkStatus();
  }, [userId, profileDone, isCefrDone, localSessionId]);

  if (
    !isLocalReady ||
    (userId && isProfileLoading) ||
    (userId && isOnboardingLoading) ||
    assessmentLoading
  ) {
    return { ready: false, canEnter: false, blockedReason: null };
  }

  // Pre-assessment completion status is determined by:
  // - Populated cefr_range on live user profile (already finished and scored)
  // - Backend session indicating it is already completed
  const assessmentDone = isCefrDone || assessmentAlreadyCompleted;

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
    session_id: localSessionId,
  };
}
