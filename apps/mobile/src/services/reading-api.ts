import { api } from "./api";

export interface QuestionOption {
  id: string;
  option_text: string;
  sort_order: number;
  is_correct: boolean;
}

export interface ReadingQuestion {
  id: string;
  question_text: string;
  sort_order: number;
  points: number;
  options: QuestionOption[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  passage_text: string;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: ReadingQuestion[];
  created_at: string;
  updated_at: string;
}

export interface ReadingAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  user_email: string;
  started_at: string;
}

export interface ReadingSubmissionRequest {
  attempt_id: string;
  answers: {
    question_id: string;
    selected_option_id: string;
  }[];
}

export interface ReadingResult {
  score: number;
  percentage: number;
  is_passed: boolean;
}

export const readingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReadingAssessments: builder.query<Assessment[], { active?: boolean } | void>({
      query: (params) => ({
        url: "/reading/assessments",
        params: params || {},
      }),
      providesTags: ["Reading"],
    }),

    getReadingAssessment: builder.query<Assessment, string>({
      query: (id) => `/reading/assessments/${id}`,
      providesTags: ["Reading"],
    }),

    createReadingAttempt: builder.mutation<ReadingAttempt, string>({
      query: (assessmentId) => ({
        url: "/reading/attempts",
        method: "POST",
        body: { assessment_id: assessmentId },
      }),
      invalidatesTags: ["Reading"],
    }),

    submitReadingAttempt: builder.mutation<ReadingResult, ReadingSubmissionRequest>({
      query: ({ attempt_id, answers }) => ({
        url: `/reading/attempts/${attempt_id}/submit`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["Reading", "Results"],
    }),
  }),
});

export const {
  useGetReadingAssessmentsQuery,
  useGetReadingAssessmentQuery,
  useCreateReadingAttemptMutation,
  useSubmitReadingAttemptMutation,
} = readingApi;
