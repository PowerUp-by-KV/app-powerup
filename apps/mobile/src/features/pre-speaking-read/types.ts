export interface SpeakingReadQuestion {
  id?: string;
  section: string;
  subSection: string;
  questionNo: number;
  sentence: string;
  noOfLines: number;
  complexity: "Easy" | "Medium" | "Advanced";
  answerType: "Record Voice";
  recordingTime: number; // in seconds
}

export interface SpeakingReadAssessment {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  questions: SpeakingReadQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SpeakingReadAttempt {
  questionId: number;
  recordingUrl: string;
  recordingDuration: number; // in seconds
  transcript?: string;
  accuracy?: number; // 0-100
  pronunciation?: number; // 0-100
  answered: boolean;
}

export interface SpeakingReadAttemptResult {
  id: string;
  assessmentId: string;
  userId: string;
  attempts: SpeakingReadAttempt[];
  totalScore: number;
  correctAnswers: number;
  completedAt: string;
  timeTaken: number; // in seconds
}
