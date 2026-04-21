import { ReadingScreen } from "@/features/pre-reading";
import { mockReadingAssessment } from "@/utils/mock-assessments";

export default function ReadRoute() {
  return <ReadingScreen assessment={mockReadingAssessment} />;
}
