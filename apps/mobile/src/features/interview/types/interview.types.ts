/**
 * src/features/interview/types/interview.types.ts
 *
 * Complete type definitions for the Interview Feedback System.
 * Covers live indicators, feedback, summaries, and reports.
 */

// ── Live Indicators (Real-time) ───────────────────────────────────────────────

export interface LiveIndicators {
  speakingPace: number; // WPM (words per minute)
  clarity: number; // 0-100
  fillerCount: number; // count of filler words
  confidence: number; // 0-100
  timestamp: number; // milliseconds
}

export interface LiveIndicatorsResponse {
  data: LiveIndicators;
  status: "live" | "completed";
}

// ── Question Feedback ─────────────────────────────────────────────────────────

export interface ScoreBreakdownItem {
  label: string; // "Relevance", "Structure", "Clarity", "Depth"
  score: number; // 0-100
  weight: number; // 0-1 (for calculating overall)
}

export interface QuestionFeedback {
  questionId: string;
  questionText: string;
  score: number; // 0-100
  breakdown: ScoreBreakdownItem[];
  starAnalysis: STARMethodAnalysis;
  feedbackItems: FeedbackItem[];
  pronunciationScore: number; // 0-100
  fillerWordsCount: number;
  modelAnswer: ModelAnswer;
  duration: number; // seconds
}

export interface FeedbackItem {
  id: string;
  type: "strength" | "improvement" | "tip";
  icon: string; // icon name from @expo/vector-icons
  text: string;
  color: string; // hex color
}

export interface ModelAnswer {
  structure: string; // "STAR" or similar
  situation: string;
  task: string;
  action: string;
  result: string;
  richText?: string; // optional rich text version
}

export interface STARMethodAnalysis {
  situation: {
    present: boolean;
    quality: "weak" | "good" | "excellent";
  };
  task: {
    present: boolean;
    quality: "weak" | "good" | "excellent";
  };
  action: {
    present: boolean;
    quality: "weak" | "good" | "excellent";
  };
  result: {
    present: boolean;
    quality: "weak" | "good" | "excellent";
  };
  overallScore: number; // 0-100
}

// ── Interview Summary ──────────────────────────────────────────────────────────

export interface CategoryScore {
  category: "Technical" | "Communication" | "Behavioral";
  score: number; // 0-100
  trend: "up" | "down" | "stable";
}

export interface InterviewSummary {
  sessionId: string;
  overallScore: number; // 0-100
  percentile: number; // 0-100
  categoryScores: CategoryScore[];
  strengths: string[];
  focusAreas: string[];
  duration: number; // seconds
  completedAt: string; // ISO string
  questionCount: number;
}

// ── Full Report ────────────────────────────────────────────────────────────────

export interface QuestionReviewItem {
  questionId: string;
  text: string;
  score: number;
  duration: number;
  feedback: string;
}

export interface Report {
  id: string;
  sessionId: string;
  candidateId: string;
  createdAt: string; // ISO string
  metadata: {
    interviewType: "practice" | "mock" | "real";
    duration: number;
    questionCount: number;
  };
  aiSummary: string; // rich text AI-generated summary
  scores: CategoryScore[];
  overallScore: number;
  questions: QuestionReviewItem[];
  downloadUrl?: string; // optional PDF download link
  shareUrl?: string; // optional share link
}

// ── API Response Wrappers ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// ── WebSocket Message Types ───────────────────────────────────────────────────

export type WebSocketMessageType = "connect" | "disconnect" | "live_indicators" | "error" | "pong";

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload?: Record<string, unknown>;
  timestamp: number;
}

// ── Cache Types ────────────────────────────────────────────────────────────────

export interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

// ── Share Types ────────────────────────────────────────────────────────────────

export type ShareType = "email" | "sms" | "social" | "link";

export interface ShareOptions {
  reportId: string;
  type: ShareType;
  message?: string;
}

// ── Standalone Interview Flow (useInterview hook) ─────────────────────────────

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface InterviewQuestion {
  id: string;
  text: string;
  hint: string;
  category: string;
  difficulty: QuestionDifficulty;
}

export interface InterviewAnswer {
  questionId: string;
  text: string;
  submittedAt: number; // epoch ms
  durationSeconds: number; // time spent on this question
}

export interface QuestionScore {
  questionId: string;
  score: number; // 0–10
  maxScore: 10;
  feedback: string;
}

export type InterviewStatus = "idle" | "in-progress" | "completed";

export interface InterviewSessionState {
  id: string;
  startTimeMs: number;
  endTimeMs: number | null;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  scores: QuestionScore[];
  currentQuestionIndex: number;
  status: InterviewStatus;
}

export interface SummaryStats {
  totalQuestions: number;
  answeredQuestions: number;
  totalScore: number;
  maxPossibleScore: number;
  averageScore: number;
  durationSeconds: number;
  performanceLabel: "Excellent" | "Good" | "Needs Improvement";
}
