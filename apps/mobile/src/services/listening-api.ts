import { api } from "./api";

export interface ListeningQuestionOption {
  id: string;
  option_text: string;
  sort_order: number;
  is_correct: boolean;
}

export interface ListeningQuestion {
  id: string;
  question_text: string;
  sort_order: number;
  points: number;
  options: ListeningQuestionOption[];
}

export interface ListeningAssessment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  audio_url: string;
  audio_duration_seconds: number;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: ListeningQuestion[];
  created_at: string;
  updated_at: string;
}

export interface ListeningAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  user_email: string;
  started_at: string;
}

export interface ListeningSubmissionRequest {
  attempt_id: string;
  answers: {
    question_id: string;
    selected_option_id: string;
  }[];
}

export interface ListeningResult {
  score: number;
  percentage: number;
  is_passed: boolean;
}

export const listeningApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getListeningAssessments: builder.query<ListeningAssessment[], { active?: boolean } | void>({
      query: (params) => ({
        url: "/listening/assessments",
        params: params || {},
      }),
      providesTags: ["Listening"],
    }),

    getListeningAssessment: builder.query<ListeningAssessment, string>({
      query: (id) => `/listening/assessments/${id}`,
      providesTags: ["Listening"],
    }),

    createListeningAttempt: builder.mutation<ListeningAttempt, string>({
      query: (assessmentId) => ({
        url: "/listening/attempts",
        method: "POST",
        body: { assessment_id: assessmentId },
      }),
      invalidatesTags: ["Listening"],
    }),

    submitListeningAttempt: builder.mutation<ListeningResult, ListeningSubmissionRequest>({
      query: ({ attempt_id, answers }) => ({
        url: `/listening/attempts/${attempt_id}/submit`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["Listening", "Results"],
    }),
  }),
});

export const {
  useGetListeningAssessmentsQuery,
  useGetListeningAssessmentQuery,
  useCreateListeningAttemptMutation,
  useSubmitListeningAttemptMutation,
} = listeningApi;
