import { api } from "./api";
import { addFeedback, markComplete, setCurrentQuestion } from "@/store/slices/mock-interview.slice";
import type { PerQuestionFeedback } from "@/store/slices/mock-interview.slice";

// ---------------------------------------------------------------------------
// Request / Response Types
// ---------------------------------------------------------------------------

export interface StartInterviewRequest {
  cefr_level: string; // e.g. "B1-B2"
  domain: string; // e.g. "IT"
  total_questions: number;
}

export interface StartInterviewResponse {
  id: string; // SESSION_UUID
  status: "in_progress";
  cefr_level: string;
  domain: string;
  total_questions: number;
  created_at: string;
}

// GET /next — two possible shapes
export type NextQuestionResponse =
  | {
      complete: false;
      question_id: string;
      question_text: string;
      question_order: number;
    }
  | { complete: true };

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  audioFile?: File; // voice path — optional
  transcript?: string; // text fallback — optional
}

export interface SubmitAnswerResponse {
  score: number;
  feedback: string;
  questions_remaining: number;
  criteria_breakdown: {
    clarity: number;
    relevance: number;
    confidence: number;
  };
}

// Attempt shape returned by GET /mock-interview (past attempts list)
// NOTE: Ilakiya — this endpoint isn't in v1 of the docs.
// Stubbed here; update the path + response shape once the endpoint is added.
export interface InterviewAttempt {
  id: string;
  status: "in_progress" | "completed";
  score: number | null;
  total_questions: number;
  created_at: string;
}

export interface GetAttemptsResponse {
  attempts: InterviewAttempt[];
}

export interface InterviewResultAnswer {
  question_id: string;
  question_text: string;
  question_order: number;
  transcript: string;
  score: number;
  feedback: string;
  criteria_breakdown: {
    clarity: number;
    relevance: number;
    confidence: number;
  };
}

export interface GetInterviewResultsResponse {
  session: {
    id: string;
    status: string;
    total_questions: number;
    created_at: string;
  };
  answers: InterviewResultAnswer[];
  grade: string; // e.g. "Excellent", "Very Good"
  overall_score: number;
}

// ---------------------------------------------------------------------------
// RTK Query — injected endpoints
// ---------------------------------------------------------------------------

const mockInterviewApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // ── 1. Start a new session ─────────────────────────────────────────────
    startInterview: builder.mutation<StartInterviewResponse, StartInterviewRequest>({
      query: (body) => ({
        url: "/mock-interview/start",
        method: "POST",
        body,
      }),
    }),

    // ── 2. Fetch next question ─────────────────────────────────────────────
    // `skip` this query until sessionId is available.
    // When the response has complete: true, dispatch markComplete() in the
    // Question screen via onQueryStarted.
    getNextQuestion: builder.query<NextQuestionResponse, string>({
      query: (sessionId) => `/mock-interview/${sessionId}/next`,
      async onQueryStarted(_sessionId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.complete) {
            dispatch(markComplete());
          } else {
            dispatch(
              setCurrentQuestion({
                questionId: data.question_id,
                questionText: data.question_text,
                questionOrder: data.question_order,
              }),
            );
          }
        } catch {
          // network / server errors are surfaced via the hook's `isError` flag
        }
      },
    }),

    // ── 3. Submit an answer (multipart/form-data) ──────────────────────────
    // RTK Query's fetchBaseQuery handles FormData automatically when you pass
    // a FormData instance as the body — it removes the Content-Type header so
    // the browser can set the correct multipart boundary itself.
    submitAnswer: builder.mutation<SubmitAnswerResponse, SubmitAnswerRequest>({
      query: ({ sessionId, questionId, audioFile, transcript }) => {
        const form = new FormData();
        form.append("question_id", questionId);
        if (audioFile) {
          form.append("audio_file", audioFile);
        }
        if (transcript) {
          form.append("transcript", transcript);
        }
        return {
          url: `/mock-interview/${sessionId}/answers`,
          method: "POST",
          body: form,
          // Do NOT set Content-Type — browser sets it with the correct boundary
          formData: true,
        };
      },
      // After a successful submission, store the feedback in Redux so the
      // Feedback screen can read it without an extra network call.
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;

          // We need the current question's text to store alongside the feedback.
          // Pull it from Redux state.
          const state = getState() as any;

          const feedback: PerQuestionFeedback = {
            questionId: arg.questionId,
            questionText: state.mockInterview.currentQuestionText ?? "",
            questionOrder: state.mockInterview.currentQuestionOrder,
            score: data.score,
            feedback: data.feedback,
            transcript: arg.transcript ?? "",
            criteriaBreakdown: {
              clarity: data.criteria_breakdown?.clarity ?? 0,
              relevance: data.criteria_breakdown?.relevance ?? 0,
              confidence: data.criteria_breakdown?.confidence ?? 0,
            },
          };

          dispatch(addFeedback(feedback));
        } catch {
          // surfaces via isError on the mutation hook
        }
      },
    }),

    // ── 4. Get final results ───────────────────────────────────────────────
    getInterviewResults: builder.query<GetInterviewResultsResponse, string>({
      query: (sessionId) => `/mock-interview/${sessionId}/results`,
    }),

    // ── 5. Get past attempts (STUBBED — endpoint not in v1 docs) ──────────
    // TODO: Update URL + response shape once Ilakiya adds the endpoint.
    getPastAttempts: builder.query<GetAttemptsResponse, void>({
      query: () => "/mock-interview/attempts",
    }),
  }),
  overrideExisting: false,
});

export const {
  useStartInterviewMutation,
  useGetNextQuestionQuery,
  useSubmitAnswerMutation,
  useGetInterviewResultsQuery,
  useGetPastAttemptsQuery,
} = mockInterviewApi;
