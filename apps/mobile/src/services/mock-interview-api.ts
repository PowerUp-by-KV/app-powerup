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
  id: string;
  status: string;
  cefr_level: string | null;
  domain: string | null;
  total_questions: number;
  questions_answered: number;
  started_at: string | null;
}

// GET /next — backend sends the question object (no complete field) or {complete: true}
export type NextQuestionResponse =
  | {
      complete?: false;
      question_id: string;
      question_text: string;
      question_order: number;
      question_type?: string;
      follow_up_prompts?: string[];
    }
  | { complete: true };

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  audioFile?: File;
  transcript?: string;
}

export interface CriteriaScore {
  name: string;
  score: number;
  feedback: string;
}

export interface SubmitAnswerResponse {
  answer_id: string;
  score: number | null;
  feedback: string | null;
  score_breakdown: {
    criteria_scores: CriteriaScore[];
    cefr_alignment: string;
  } | null;
  questions_remaining: number;
  session_complete: boolean;
}

// Attempt shape returned by GET /mock-interview (past attempts list)
// NOTE: Ilakiya — this endpoint isn't in v1 of the docs.
// Stubbed here; update the path + response shape once the endpoint is added.
export interface InterviewAttempt {
  id: string;
  status: "in_progress" | "completed";
  total_questions: number;
  questions_answered: number;
  total_score: number | null;
  started_at: string | null;
}

export interface GetAttemptsResponse {
  attempts: InterviewAttempt[];
}

export interface InterviewResultAnswer {
  id: string;
  question_id: string;
  question_order: number;
  transcript: string | null;
  audio_url: string | null;
  score: number | null;
  feedback: string | null;
  score_breakdown: {
    criteria_scores: CriteriaScore[];
    cefr_alignment: string;
  } | null;
  answered_at: string;
}

export interface GetInterviewResultsResponse {
  session: {
    id: string;
    status: string;
    total_questions: number;
    questions_answered: number;
    total_score: number | null;
    started_at: string | null;
  };
  answers: InterviewResultAnswer[];
  grade: string;
}

// ---------------------------------------------------------------------------
// RTK Query — injected endpoints
// ---------------------------------------------------------------------------

const mockInterviewApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── 1. Start a new session ─────────────────────────────────────────────
    startInterview: builder.mutation<StartInterviewResponse, StartInterviewRequest>({
      query: (body) => ({
        url: "/v1/mock-interview/start",
        method: "POST",
        body,
      }),
    }),

    // ── 2. Fetch next question ─────────────────────────────────────────────
    // `skip` this query until sessionId is available.
    // When the response has complete: true, dispatch markComplete() in the
    // Question screen via onQueryStarted.
    getNextQuestion: builder.query<NextQuestionResponse, string>({
      query: (sessionId) => `/v1/mock-interview/${sessionId}/next`,
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
          url: `/v1/mock-interview/${sessionId}/answers`,
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
          const state = getState() as any;

          // Map the criteria_scores array to the fixed-key shape the slice expects.
          // The AI returns dynamic criterion names — match by substring or fall back by index.
          const criteriaScores = data.score_breakdown?.criteria_scores ?? [];
          const findByName = (keyword: string, fallbackIdx: number) => {
            const match = criteriaScores.find((c) => c.name.toLowerCase().includes(keyword));
            return match?.score ?? criteriaScores[fallbackIdx]?.score ?? 0;
          };

          const feedback: PerQuestionFeedback = {
            questionId: arg.questionId,
            questionText: state.mockInterview.currentQuestionText ?? "",
            questionOrder: state.mockInterview.currentQuestionOrder,
            score: data.score ?? 0,
            feedback: data.feedback ?? "",
            transcript: arg.transcript ?? "",
            criteriaBreakdown: {
              clarity: findByName("clarity", 0),
              relevance: findByName("relevance", 1),
              confidence: findByName("confidence", 2),
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
      query: (sessionId) => `/v1/mock-interview/${sessionId}/results`,
    }),

    // ── 5. Get past attempts (STUBBED — endpoint not in v1 docs) ──────────
    // TODO: Update URL + response shape once Ilakiya adds the endpoint.
    getPastAttempts: builder.query<GetAttemptsResponse, void>({
      query: () => "/v1/mock-interview/attempts",
    }),
  }),
});

export const {
  useStartInterviewMutation,
  useGetNextQuestionQuery,
  useSubmitAnswerMutation,
  useGetInterviewResultsQuery,
  useGetPastAttemptsQuery,
} = mockInterviewApi;
