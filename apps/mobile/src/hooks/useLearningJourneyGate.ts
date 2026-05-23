import { useEffect, useState } from "react";

import { useGetProfileQuery } from "@/services/auth-api";
import {
  getProfileCompletedInSession,
  getPreAssessmentCompletedInSession,
  setPreAssessmentCompletedInSession,
} from "@/services/auth-storage";

export type GateReason = "onboarding" | "assessment" | null;

export interface LearningJourneyGate {
  ready: boolean;
  canEnter: boolean;
  blockedReason: GateReason;
}

export function useLearningJourneyGate(): LearningJourneyGate {
  const { data: profile, isLoading } = useGetProfileQuery();
  const [localDone, setLocalDone] = useState<boolean | null>(null);
  const [localPreAssessmentDone, setLocalPreAssessmentDone] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getProfileCompletedInSession(), getPreAssessmentCompletedInSession()]).then(
      ([done, preDone]) => {
        if (mounted) {
          setLocalDone(done);
          setLocalPreAssessmentDone(preDone);
        }
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  // Sync server assessment completion to local storage for seamless cross-device/re-login usage
  useEffect(() => {
    if (profile?.cefr_range && profile?.profile_completed && localPreAssessmentDone === false) {
      setPreAssessmentCompletedInSession(true).then(() => {
        setLocalPreAssessmentDone(true);
      });
    }
  }, [profile, localPreAssessmentDone]);

  if (isLoading || localDone === null || localPreAssessmentDone === null) {
    return { ready: false, canEnter: false, blockedReason: null };
  }

  // Use || (not ??) so the local flag compensates when the backend flag is
  // false due to propagation lag or the flag not being set on this device yet.
  const profileDone = (profile?.profile_completed ?? false) || localDone;

  // A user has completed pre-assessment if:
  // - They explicitly have a local/session pre-assessment completed flag OR
  // - Their server profile has a cefr_range (provided they didn't just clear localPreAssessmentDone during onboarding)
  const assessmentDone =
    localPreAssessmentDone || (!!profile?.cefr_range && localPreAssessmentDone !== false);

  const canEnter = profileDone && assessmentDone;
  const blockedReason: GateReason = !profileDone
    ? "onboarding"
    : !assessmentDone
      ? "assessment"
      : null;

  return { ready: true, canEnter, blockedReason };
}
