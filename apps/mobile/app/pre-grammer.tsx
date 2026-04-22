import { GrammarScreen } from "@/features/pre-grammar";
import { mockGrammarAssessment } from "@/utils/mock-assessments";

export default function WriteRoute() {
  return <GrammarScreen assessment={mockGrammarAssessment} />;
}
