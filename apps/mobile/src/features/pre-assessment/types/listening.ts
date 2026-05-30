export interface ListeningQuestion {
  section: string;
  subSection: string;
  questionNo: number;
  audioText: string;
  audioDuration: number; // in seconds
  noOfLines: number;
  complexity: "Easy" | "Medium" | "Advanced";
  answerType: "Record Voice";
  recordingTime: number; // in seconds
}

export interface ListeningAssessment {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  questions: ListeningQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ListeningAttempt {
  questionId: number;
  recordingUrl: string;
  recordingDuration: number; // in seconds
  transcript?: string;
  timeSpent: number; // in seconds
  answered: boolean;
}

export interface ListeningAttemptResult {
  id: string;
  assessmentId: string;
  userId: string;
  attempts: ListeningAttempt[];
  totalScore: number;
  correctAnswers: number;
  completedAt: string;
  timeTaken: number; // in seconds
}
