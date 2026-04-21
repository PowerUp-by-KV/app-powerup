export type GrammarTopic =
  | "Verbs"
  | "Tense"
  | "Articles"
  | "Prepositions"
  | "Active into Passive voice"
  | "Articles into Passive voice";
export type GrammarQuestionType =
  | "MCQ"
  | "Fill in the Blanks"
  | "Identify the grammatical error in sentence";

export interface GrammarQuestion {
  section: string;
  subSection: string;
  topic: GrammarTopic;
  blanks?: number;
  questionType: GrammarQuestionType;
  question: string;
  complexity: "Easy" | "Medium" | "Advanced";
  answerType: "MCQ" | "Fill in the Blanks" | "Text Answer";
  options?: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
  correctAnswer: string;
}

export interface GrammarAssessment {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  questions: GrammarQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface GrammarAttempt {
  questionId: number;
  selectedAnswer: string;
  timeSpent: number; // in seconds
  answered: boolean;
  isCorrect?: boolean;
}

export interface GrammarAttemptResult {
  id: string;
  assessmentId: string;
  userId: string;
  attempts: GrammarAttempt[];
  totalScore: number;
  correctAnswers: number;
  completedAt: string;
  timeTaken: number; // in seconds
}
