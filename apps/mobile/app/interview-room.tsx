import { useLocalSearchParams } from "expo-router";

import { InterviewRoomScreen } from "@/features/interview-playground";

export default function InterviewRoomRoute() {
  const { session_id, mode } = useLocalSearchParams<{ session_id: string; mode?: string }>();
  return (
    <InterviewRoomScreen sessionId={session_id} mode={mode === "buddy" ? "buddy" : "playground"} />
  );
}
