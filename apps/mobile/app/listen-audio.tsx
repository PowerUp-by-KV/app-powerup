import { PreListenWithAudioScreen } from "@/features/pre-listen-with-audio";
import { mockListenWithAudioAssessment } from "@/utils/mock-assessments";

export default function ListenAudioRoute() {
  return <PreListenWithAudioScreen assessment={mockListenWithAudioAssessment} />;
}
