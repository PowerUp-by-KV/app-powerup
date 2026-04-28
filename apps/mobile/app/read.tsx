import { useLocalSearchParams } from "expo-router";
import { ReadingScreen } from "@/features/pre-reading";

export default function ReadRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <ReadingScreen sessionId={session_id} />;
}
