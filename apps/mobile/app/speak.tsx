import { useLocalSearchParams } from "expo-router";
import { SpeakingScreen } from "@/features/pre-assessment";

export default function SpeakRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <SpeakingScreen sessionId={session_id} />;
}
