import { useLocalSearchParams } from "expo-router";
import { GrammarScreen } from "@/features/pre-assessment";

export default function WriteRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <GrammarScreen sessionId={session_id} />;
}
