export interface GrammarQuestionOption {
  id: string;
  label: string;
  is_correct: boolean;
}

export interface GrammarQuestion {
  id: string;
  question_text: string;
  points?: number;
  options: GrammarQuestionOption[];
}

export interface GrammarAssessment {
  id: string;
  title: string;
  description: string;
  questions: GrammarQuestion[];
}

export interface GrammarAttempt {
  id: string;
  assessment_id: string;
}

const sampleQuestions: GrammarQuestion[] = [
  {
    id: "gq-1",
    question_text: "Choose the correct form of the verb.",
    points: 1,
    options: [
      { id: "gq-opt-1", label: "Runs", is_correct: false },
      { id: "gq-opt-2", label: "Running", is_correct: true },
      { id: "gq-opt-3", label: "Ran", is_correct: false },
    ],
  },
];

export async function fetchGrammarAssessments(_active?: boolean): Promise<GrammarAssessment[]> {
  return [
    {
      id: "grammar-1",
      title: "Grammar Basics",
      description: "Practice simple grammar questions.",
      questions: sampleQuestions,
    },
  ];
}

export async function fetchGrammarAssessment(id: string): Promise<GrammarAssessment> {
  return {
    id,
    title: "Grammar Basics",
    description: "Practice simple grammar questions.",
    questions: sampleQuestions,
  };
}

export async function createGrammarAttempt(assessmentId: string): Promise<GrammarAttempt> {
  return { id: `${assessmentId}-attempt`, assessment_id: assessmentId };
}

export async function submitGrammarAttempt(
  _attemptId: string,
  _answers: unknown,
): Promise<{ score: number; percentage: number; is_passed: boolean }> {
  return { score: 0, percentage: 0, is_passed: false };
}
