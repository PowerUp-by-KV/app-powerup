import { SpeakingScreen } from "@/features/pre-speaking";
import { mockSpeakingAssessment } from "@/utils/mock-assessments";

export default function SpeakRoute() {
  return <SpeakingScreen assessment={mockSpeakingAssessment} />;
}
