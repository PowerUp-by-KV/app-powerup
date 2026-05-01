export interface ReadingQuestion {
  section: string;
  subSection: string;
  topic: string;
  paragraph: string;
  questionType: "MCQ" | "Fill in the blanks";
  question: string;
  complexity: "Easy" | "Medium" | "Advanced";
  options: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
  answer: string;
}

export interface ReadingAssessment {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  timeLimit: number; // in minutes
  passingScore: number;
  questions: ReadingQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionAttempt {
  questionId: number;
  selectedAnswer: string;
  timeSpent: number; // in seconds
  answered: boolean;
}

export interface ReadingAttemptResult {
  id: string;
  assessmentId: string;
  userId: string;
  attempts: QuestionAttempt[];
  totalScore: number;
  correctAnswers: number;
  completedAt: string;
  timeTaken: number; // in seconds
}
