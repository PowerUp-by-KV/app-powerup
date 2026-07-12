import { useLocalSearchParams } from "expo-router";

import { PipelineInterviewRoomScreen } from "@/features/interview-playground/screens/PipelineInterviewRoomScreen";

export default function PipelineInterviewRoomRoute() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return <PipelineInterviewRoomScreen mode={mode === "buddy" ? "buddy" : "playground"} />;
}
