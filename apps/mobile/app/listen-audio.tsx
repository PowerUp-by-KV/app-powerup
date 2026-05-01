import { useLocalSearchParams } from "expo-router";
import { PreListenWithAudioScreen } from "@/features/pre-listen-with-audio";

export default function ListenAudioRoute() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  return <PreListenWithAudioScreen sessionId={session_id} />;
}
