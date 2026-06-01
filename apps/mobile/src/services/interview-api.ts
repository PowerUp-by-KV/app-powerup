import { api } from "./api";

// ---------------------------------------------------------------------------
// Types — Practice / Interview History
// These are the shapes returned by GET /api/v1/practice/history
// Used by: interview-history feature screens and components
// ---------------------------------------------------------------------------

export interface PracticeResponse {
  response_id: string;
  question_text: string;
  user_answer: string;
  audio_url?: string;
  ai_feedback?: string;
  score?: number;
  created_at: string;
}

export interface PracticeSession {
  session_id: string;
  status: string;
  created_at: string;
  response_count: number;
  responses: PracticeResponse[];
}

export type PracticeHistoryResponse = PracticeSession[];

// ---------------------------------------------------------------------------
// RTK Query — Practice History endpoint
//
// NOTE: All mock-interview endpoints (startMockInterview, getNextQuestion,
// submitMockAnswer, getMockInterviewResults, etc.) live exclusively in
// mock-interview-api.ts. Do NOT add them here — duplicate injectEndpoints
// calls for the same endpoint name on the same `api` instance cause a
// runtime RTK Query warning and undefined behaviour.
// ---------------------------------------------------------------------------

export const practiceHistoryApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getPracticeHistory: builder.query<PracticeHistoryResponse, void>({
      query: () => ({
        url: "/v1/practice/history",
        method: "GET",
      }),
      providesTags: ["PracticeHistory"],
    }),
  }),
});

export const { useGetPracticeHistoryQuery } = practiceHistoryApi;
