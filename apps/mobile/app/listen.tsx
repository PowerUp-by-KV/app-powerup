import { useLocalSearchParams } from "expo-router";
import { ListeningScreen } from "@/features/pre-assessment";

export default function ListenRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <ListeningScreen sessionId={session_id} />;
}
