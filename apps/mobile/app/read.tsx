import { useLocalSearchParams } from "expo-router";
import { ReadingScreen } from "@/features/pre-assessment";

export default function ReadRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <ReadingScreen sessionId={session_id} />;
}

