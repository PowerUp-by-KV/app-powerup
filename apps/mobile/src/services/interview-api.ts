/**
 * Interview History API Service
 * RTK Query endpoints for practice history management
 */

import { api } from "./api";

// ---------- Response Types ----------

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

// ---------- RTK Query Endpoints ----------

export const interviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/practice/history - Get practice history
    getPracticeHistory: builder.query<PracticeHistoryResponse, void>({
      query: () => ({
        url: "/v1/practice/history",
        method: "GET",
      }),
      providesTags: ["PracticeHistory"],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log("[interviewApi] getPracticeHistory: success");
        } catch (error: unknown) {
          console.error("[interviewApi] getPracticeHistory: error", error);
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetPracticeHistoryQuery } = interviewApi;
