// Screens (all screens including legacy and new ones)
export {
  InterviewScreen,
  LiveInterviewScreen,
  QuestionFeedbackScreen,
  InterviewSummaryScreen,
  FullReportScreen,
  // New screens (API-backed)
  CoachInterviewScreen,
  QuestionFeedbackScreenNew,
  InterviewSummaryScreenNew,
  // Standalone Interview Coach flow (static questions + mock scoring)
  InterviewStartScreen,
  QuestionScreen,
  SummaryScreen,
} from "./screens";

// Components (re-exported from domain barrels via components/index.ts)
export {
  LiveIndicator,
  STARMethodIndicator,
  ScoreCard,
  ScoreBreakdown,
  FeedbackItem,
  QuestionReviewItem,
  ModelAnswerModal,
  CategoryScoresChart,
  ErrorBoundary,
} from "./components";

// Hooks
export { useLiveIndicators, useInterviewSession } from "./hooks";
export type { UseInterviewSessionReturn, InterviewSessionState } from "./hooks";

// Standalone interview coach hook + data
export { useInterview, INTERVIEW_QUESTIONS } from "./hooks";
export type { UseInterviewReturn } from "./hooks";

// Context (for use in standalone interview coach flow)
export { InterviewProvider, useInterviewContext } from "./context/InterviewContext";

// Types
export type * from "./types/interview.types";

// Services
export * from "./services/interviewFeedbackApi";
