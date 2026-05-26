export interface ListenWithAudioQuestion {
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

export interface ListenWithAudioAssessment {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  questions: ListenWithAudioQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ListenWithAudioAttempt {
  questionId: number;
  recordingUrl: string;
  recordingDuration: number; // in seconds
  transcript?: string;
  timeSpent: number; // in seconds
  answered: boolean;
}

export interface ListenWithAudioAttemptResult {
  id: string;
  assessmentId: string;
  userId: string;
  attempts: ListenWithAudioAttempt[];
  totalScore: number;
  correctAnswers: number;
  completedAt: string;
  timeTaken: number; // in seconds
}
