import { useLocalSearchParams } from "expo-router";

import { InterviewRoomScreen } from "@/features/interview-playground";

export default function InterviewRoomRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <InterviewRoomScreen sessionId={session_id} />;
}
