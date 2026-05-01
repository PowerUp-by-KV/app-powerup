export interface SpeakingQuestion {
  section: string;
  subSection: string;
  topic: string;
  questionType: "Describing Topic Question";
  question: string;
  complexity: "Easy" | "Medium" | "Advanced";
  answerType: "Record Voice";
  recordingTime: number; // in seconds
}

export interface SpeakingAssessment {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  questions: SpeakingQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SpeakingAttempt {
  questionId: number;
  recordingUrl: string;
  recordingDuration: number; // in seconds
  transcript?: string;
  fluency?: number; // 0-100
  pronunciation?: number; // 0-100
  answered: boolean;
}

export interface SpeakingAttemptResult {
  id: string;
  assessmentId: string;
  userId: string;
  attempts: SpeakingAttempt[];
  totalScore: number;
  correctAnswers: number;
  completedAt: string;
  timeTaken: number; // in seconds
}
