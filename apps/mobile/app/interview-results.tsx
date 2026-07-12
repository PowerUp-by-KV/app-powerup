import { useLocalSearchParams } from "expo-router";

import { InterviewResultsScreen } from "@/features/interview-playground";

export default function InterviewResultsRoute() {
  const { session_id, mode, transport } = useLocalSearchParams<{
    session_id: string;
    mode?: string;
    transport?: string;
  }>();
  return (
    <InterviewResultsScreen
      sessionId={session_id}
      mode={mode === "buddy" ? "buddy" : "playground"}
      transport={transport === "pipeline" ? "pipeline" : "webrtc"}
    />
  );
}
