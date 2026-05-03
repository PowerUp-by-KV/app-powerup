import { useLocalSearchParams } from "expo-router";
import { SpeakingReadScreen } from "@/features/pre-speaking-read";

export default function SpeakReadRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <SpeakingReadScreen sessionId={session_id} />;
}
