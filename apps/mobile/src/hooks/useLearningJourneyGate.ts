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

  // API flag is authoritative; SecureStore flag covers offline / existing sessions
  const profileDone = profile?.profile_completed ?? localDone;
  const hasCefr = !!profile?.cefr_range;
  const canEnter = profileDone && hasCefr;
  const blockedReason: GateReason = !profileDone ? "onboarding" : !hasCefr ? "assessment" : null;
  return { ready: true, canEnter, blockedReason };
}
