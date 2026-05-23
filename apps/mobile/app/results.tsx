import { useLocalSearchParams } from "expo-router";
import { ResultsScreen } from "@/features/results";

export default function ResultsRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <ResultsScreen sessionId={session_id} />;
}
