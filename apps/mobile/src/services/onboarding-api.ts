import { api } from "./api";

export interface QuestionOption {
  [key: string]: string;
}

export interface OnboardingQuestion {
  id: string;
  section: string;
  question_no: number;
  question_key: string;
  question_text: string;
  question_type: string;
  input_type: string;
  options: QuestionOption;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type GroupedOnboardingQuestions = Record<string, OnboardingQuestion[]>;

export interface OnboardingAnswer {
  question_id: string;
  answer_text?: string;
  answer_json?: Record<string, any>;
  is_skipped: boolean;
}

export interface OnboardingSubmissionRequest {
  answers: OnboardingAnswer[];
}

export interface OnboardingResult {
  message: string;
  answers: any[];
}

export const onboardingApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getGroupedQuestions: builder.query<GroupedOnboardingQuestions, void>({
      query: () => "/v1/onboarding/questions/grouped",
      providesTags: ["Onboarding"],
    }),
    submitOnboarding: builder.mutation<OnboardingResult, OnboardingSubmissionRequest>({
      query: (data) => ({
        url: "/v1/onboarding/questions/answers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Onboarding"],
    }),
  }),
});

export const { useGetGroupedQuestionsQuery, useSubmitOnboardingMutation } = onboardingApi;
