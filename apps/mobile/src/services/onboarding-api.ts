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
  options: string[] | QuestionOption | null;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type GroupedOnboardingQuestions = Record<string, OnboardingQuestion[]>;

export interface OnboardingAnswer {
  question_id: string;
  answer_text: string;
}
export interface OnboardingSubmissionRequest {
  answers: OnboardingAnswer[];
}

export interface OnboardingRequest {
  name: string;
  mobile: string;
  dob: string; // ISO date string
  college: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  mobile: string;
  dob: string;
  college: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingResponse {
  profile: UserProfile;
  message: string;
}

export interface OnboardingResult {
  message: string;
  answers: OnboardingAnswerRead[];
}

export interface OnboardingAnswerRead {
  id: string;
  user_id: string;
  question_id: string;
  answer_text?: string;
  answer_json?: any;
  is_skipped: boolean;
  answered_at: string;
  created_at: string;
}

export interface ResumeUploadResponse {
  id: string;
  file_url: string;
  parse_status: string;
  created_at: string;
  message?: string;
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
    completeProfile: builder.mutation<OnboardingResponse, OnboardingRequest>({
      query: (data) => ({
        url: "/v1/onboarding",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Onboarding", "Auth"],
    }),
    uploadResume: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: "/v1/onboarding/resume",
        method: "POST",
        body: formData,
        formData: true,
      }),
    }),
  }),
});

export const {
  useGetGroupedQuestionsQuery,
  useSubmitOnboardingMutation,
  useUploadResumeMutation,
  useCompleteProfileMutation,
} = onboardingApi;
