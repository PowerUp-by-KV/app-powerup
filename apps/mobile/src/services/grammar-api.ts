import { api } from "./api";

export interface GrammarQuestionOption {
  id: string;
  option_text: string;
  sort_order: number;
  is_correct: boolean;
}

export interface GrammarQuestion {
  id: string;
  question_text: string;
  sort_order: number;
  points: number;
  options: GrammarQuestionOption[];
}

export interface GrammarAssessment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  topic: string;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: GrammarQuestion[];
  created_at: string;
  updated_at: string;
}

export interface GrammarAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  user_email: string;
  started_at: string;
}

export interface GrammarSubmissionRequest {
  attempt_id: string;
  answers: {
    question_id: string;
    answer_text: string;
  }[];
}

export interface GrammarResult {
  score: number;
  percentage: number;
  is_passed: boolean;
}

export const grammarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGrammarAssessments: builder.query<GrammarAssessment[], { active?: boolean } | void>({
      query: (params) => ({
        url: "/grammar/assessments",
        params: params || {},
      }),
      providesTags: ["Grammar"],
    }),

    getGrammarAssessment: builder.query<GrammarAssessment, string>({
      query: (id) => `/grammar/assessments/${id}`,
      providesTags: ["Grammar"],
    }),

    createGrammarAttempt: builder.mutation<GrammarAttempt, string>({
      query: (assessmentId) => ({
        url: "/grammar/attempts",
        method: "POST",
        body: { assessment_id: assessmentId },
      }),
      invalidatesTags: ["Grammar"],
    }),

    submitGrammarAttempt: builder.mutation<GrammarResult, GrammarSubmissionRequest>({
      query: ({ attempt_id, answers }) => ({
        url: `/grammar/attempts/${attempt_id}/submit`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["Grammar", "Results"],
    }),
  }),
});

export const {
  useGetGrammarAssessmentsQuery,
  useGetGrammarAssessmentQuery,
  useCreateGrammarAttemptMutation,
  useSubmitGrammarAttemptMutation,
} = grammarApi;
