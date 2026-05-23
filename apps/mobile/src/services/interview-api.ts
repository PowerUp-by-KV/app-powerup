import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InterviewSession {
  id: string;
  status: "in_progress" | "completed" | "abandoned";
  cefr_level: string | null;
  domain: string | null;
  total_questions: number;
  questions_answered: number;
  total_score: number | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface CriteriaScore {
  name: string;
  score: number;
  feedback: string;
}

export interface InterviewAnswer {
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

export interface NextQuestion {
  question_id: string;
  question_text: string;
  question_type: string;
  follow_up_prompts: string[];
  question_order: number;
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

export interface InterviewResultResponse {
  session: InterviewSession;
  answers: InterviewAnswer[];
  grade: "Needs Practice" | "Good" | "Very Good" | "Excellent";
}

// ─── Mock Interview (Sequential) Endpoints ────────────────────────────────────

export const mockInterviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    startMockInterview: builder.mutation<
      InterviewSession,
      { cefr_level: string; domain?: string; total_questions?: number }
    >({
      query: (body) => ({
        url: "/v1/mock-interview/start",
        method: "POST",
        body: { domain: "general", total_questions: 8, ...body },
      }),
    }),

    getNextQuestion: builder.query<NextQuestion | { complete: true }, string>({
      query: (sessionId) => `/v1/mock-interview/${sessionId}/next`,
    }),

    submitMockAnswer: builder.mutation<
      SubmitAnswerResponse,
      { sessionId: string; formData: FormData }
    >({
      query: ({ sessionId, formData }) => ({
        url: `/v1/mock-interview/${sessionId}/answers`,
        method: "POST",
        body: formData,
      }),
    }),

    getMockInterviewResults: builder.query<InterviewResultResponse, string>({
      query: (sessionId) => `/v1/mock-interview/${sessionId}/results`,
    }),

    getMockInterviewHistory: builder.query<InterviewSession[], void>({
      query: () => "/v1/mock-interview/history",
    }),

    abandonMockInterview: builder.mutation<InterviewSession, string>({
      query: (sessionId) => ({
        url: `/v1/mock-interview/${sessionId}/abandon`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useStartMockInterviewMutation,
  useGetNextQuestionQuery,
  useLazyGetNextQuestionQuery,
  useSubmitMockAnswerMutation,
  useGetMockInterviewResultsQuery,
  useGetMockInterviewHistoryQuery,
  useAbandonMockInterviewMutation,
} = mockInterviewApi;
