import { useLocalSearchParams } from "expo-router";
import { ListenWithAudioScreen } from "@/features/pre-assessment";

export default function ListenAudioRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <ListenWithAudioScreen sessionId={session_id} />;
}

