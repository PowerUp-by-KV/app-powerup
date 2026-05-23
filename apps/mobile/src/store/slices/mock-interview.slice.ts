import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PerQuestionFeedback {
  questionId: string;
  questionText: string;
  questionOrder: number;
  score: number;
  feedback: string;
  transcript: string;
  criteriaBreakdown: {
    clarity: number;
    relevance: number;
    confidence: number;
  };
}

export type InterviewStatus = "idle" | "in_progress" | "completed";

interface MockInterviewState {
  // Session identifiers
  sessionId: string | null;
  totalQuestions: number;

  // Current question being answered
  currentQuestionId: string | null;
  currentQuestionText: string | null;
  currentQuestionOrder: number;

  // Tracks the answer mode the user chose
  answerMode: "voice" | "text";

  // Accumulated feedback for all answered questions (used on Result screen)
  feedbackHistory: PerQuestionFeedback[];

  // The most recent single-question feedback (used on Feedback screen)
  latestFeedback: PerQuestionFeedback | null;

  // Session lifecycle
  status: InterviewStatus;
  isComplete: boolean;

  // Final result data (populated after GET /results)
  finalScore: number | null;
  finalGrade: string | null;
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: MockInterviewState = {
  sessionId: null,
  totalQuestions: 0,

  currentQuestionId: null,
  currentQuestionText: null,
  currentQuestionOrder: 0,

  answerMode: "voice",

  feedbackHistory: [],
  latestFeedback: null,

  status: "idle",
  isComplete: false,

  finalScore: null,
  finalGrade: null,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const mockInterviewSlice = createSlice({
  name: "mockInterview",
  initialState,
  reducers: {
    // Called after POST /mock-interview/start  OR  when resuming an in-progress session
    setSession(
      state,
      action: PayloadAction<{
        sessionId: string;
        totalQuestions: number;
        status: InterviewStatus;
      }>,
    ) {
      state.sessionId = action.payload.sessionId;
      state.totalQuestions = action.payload.totalQuestions;
      state.status = action.payload.status;
      state.isComplete = false;
      // Clear stale data from any previous run
      state.feedbackHistory = [];
      state.latestFeedback = null;
      state.finalScore = null;
      state.finalGrade = null;
      state.currentQuestionId = null;
      state.currentQuestionText = null;
      state.currentQuestionOrder = 0;
    },

    // Called after GET /mock-interview/{session_id}/next
    setCurrentQuestion(
      state,
      action: PayloadAction<{
        questionId: string;
        questionText: string;
        questionOrder: number;
      }>,
    ) {
      state.currentQuestionId = action.payload.questionId;
      state.currentQuestionText = action.payload.questionText;
      state.currentQuestionOrder = action.payload.questionOrder;
    },

    // User taps "Type answer instead" / "Record answer instead"
    setAnswerMode(state, action: PayloadAction<"voice" | "text">) {
      state.answerMode = action.payload;
    },

    // Called after POST /mock-interview/{session_id}/answers
    addFeedback(state, action: PayloadAction<PerQuestionFeedback>) {
      state.latestFeedback = action.payload;
      state.feedbackHistory.push(action.payload);
    },

    // Called when GET /next returns { complete: true }
    markComplete(state) {
      state.isComplete = true;
      state.status = "completed";
    },

    // Called after GET /mock-interview/{session_id}/results
    setFinalResult(state, action: PayloadAction<{ score: number; grade: string }>) {
      state.finalScore = action.payload.score;
      state.finalGrade = action.payload.grade;
    },

    // Full reset — used when user navigates back to lobby after finishing
    resetInterview() {
      return initialState;
    },
  },
});

export const {
  setSession,
  setCurrentQuestion,
  setAnswerMode,
  addFeedback,
  markComplete,
  setFinalResult,
  resetInterview,
} = mockInterviewSlice.actions;

export default mockInterviewSlice.reducer;
