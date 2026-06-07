import { useLocalSearchParams } from "expo-router";

import { InterviewResultsScreen } from "@/features/interview-playground";

export default function InterviewResultsRoute() {
  const { session_id, mode } = useLocalSearchParams<{ session_id: string; mode?: string }>();
  return (
    <InterviewResultsScreen
      sessionId={session_id}
      mode={mode === "buddy" ? "buddy" : "playground"}
    />
  );
}
