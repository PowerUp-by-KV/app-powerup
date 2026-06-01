import { useLocalSearchParams } from "expo-router";

import { InterviewResultsScreen } from "@/features/interview-playground";

export default function InterviewResultsRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <InterviewResultsScreen sessionId={session_id} />;
}
