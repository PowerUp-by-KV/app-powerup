import { useEffect, useState } from "react";

import { useGetProfileQuery } from "@/services/auth-api";
import { getProfileCompletedInSession } from "@/services/auth-storage";

export type GateReason = "onboarding" | "assessment" | null;

export interface LearningJourneyGate {
  ready: boolean;
  canEnter: boolean;
  blockedReason: GateReason;
}

export function useLearningJourneyGate(): LearningJourneyGate {
  const { data: profile, isLoading } = useGetProfileQuery();
  const [localDone, setLocalDone] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    getProfileCompletedInSession().then((done) => {
      if (mounted) setLocalDone(done);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading || localDone === null) {
    return { ready: false, canEnter: false, blockedReason: null };
  }

  // If the user already has a cefr_range they have completed BOTH onboarding
  // and the pre-assessment — always let them through regardless of profile_completed.
  const hasCefr = !!profile?.cefr_range;
  if (hasCefr) {
    return { ready: true, canEnter: true, blockedReason: null };
  }

  // Use || (not ??) so the local flag compensates when the backend flag is
  // false due to propagation lag or the flag not being set on this device yet.
  const profileDone = (profile?.profile_completed ?? false) || localDone;

  const canEnter = profileDone && hasCefr;
  const blockedReason: GateReason = !profileDone ? "onboarding" : !hasCefr ? "assessment" : null;
  return { ready: true, canEnter, blockedReason };
}
