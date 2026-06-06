import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCheckAssessmentStatusQuery, getNextRouteForSection } from "@/services/assessment-api";
import { saveAssessmentSessionId, syncCompletedSections } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";

export default function AssessmentEntryScreen() {
  const router = useRouter();
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();

  const {
    data: session,
    isError,
    error,
  } = useCheckAssessmentStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (session) {
      const runRouting = async () => {
        try {
          const currentSessionId = session_id || session.session_id;
          if (currentSessionId) {
            await saveAssessmentSessionId(currentSessionId);
          }

          const backendCompleted = session.completed_sections || [];
          await syncCompletedSections(backendCompleted);

          const notCompleted = session.not_completed_sections || [];
          const allSections = [
            "A_READING",
            "A_SPEAKING",
            "A_LISTEN",
            "B_SPEAKING",
            "C_GRAMMAR",
            "D_LISTEN_ANSWER",
          ];
          const activeNotCompleted = notCompleted.filter((sec) => !backendCompleted.includes(sec));

          let targetSec = activeNotCompleted[0];
          if (!targetSec) {
            if (session.current_section && !backendCompleted.includes(session.current_section)) {
              targetSec = session.current_section;
            }
          }
          if (!targetSec) {
            if (session.first_section && !backendCompleted.includes(session.first_section)) {
              targetSec = session.first_section;
            }
          }
          if (!targetSec) {
            targetSec = allSections.find((sec) => !backendCompleted.includes(sec)) || "A_READING";
          }

          const targetRoute = getNextRouteForSection(targetSec);
          router.replace({
            pathname: targetRoute as never,
            params: { session_id: currentSessionId },
          });
        } catch (err) {
          console.warn("Failed inside assessment-entry routing:", err);
          router.replace("/(tabs)" as never);
        }
      };
      runRouting();
    }
  }, [session, session_id, router]);

  useEffect(() => {
    if (isError) {
      console.warn("Assessment entry error fetching session:", error);
      router.replace("/(tabs)" as never);
    }
  }, [isError, error, router]);

  return <GamifiedMascotLoader title="Preparing Pre-Assessment..." />;
}
