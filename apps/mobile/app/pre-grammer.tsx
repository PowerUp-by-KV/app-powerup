import { GrammerScreen } from "@/features/pre-grammar";
import { mockGrammarAssessment } from "@/utils/mock-assessments";

export default function WriteRoute() {
  return <GrammerScreen assessment={mockGrammarAssessment} />;
}
