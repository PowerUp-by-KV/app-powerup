import { SpeakingReadScreen } from "@/features/pre-speaking-read";
import { mockSpeakingReadAssessment } from "@/utils/mock-assessments";

export default function SpeakReadRoute() {
  return <SpeakingReadScreen assessment={mockSpeakingReadAssessment} />;
}
