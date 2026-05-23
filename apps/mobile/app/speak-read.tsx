import { useLocalSearchParams } from "expo-router";
import { SpeakingReadScreen } from "@/features/pre-assessment";

export default function SpeakReadRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <SpeakingReadScreen sessionId={session_id} />;
}
