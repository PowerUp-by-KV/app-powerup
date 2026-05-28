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

// Shape returned by GET /v1/onboarding/answers
export interface OnboardingSectionQuestion {
  question: {
    id: string;
    section: string;
    question_no: number;
    question_key: string;
    question_text: string;
    question_type: string;
    input_type: string;
    options: string[] | Record<string, string> | null;
    is_required: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  answer: {
    id: string;
    user_id: string;
    question_id: string;
    answer_text: string | null;
    answer_json: any | null;
    is_skipped: boolean;
    answered_at: string;
    created_at: string;
  } | null;
}

export interface OnboardingSectionEntry {
  section: string;
  questions: OnboardingSectionQuestion[];
}

export interface OnboardingSectionsResponse {
  onboarding_sections: OnboardingSectionEntry[];
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
      invalidatesTags: ["Onboarding", "Auth"],
    }),

    extractOnboardingResume: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/v1/onboarding/resume/extract",
        method: "POST",
        body: formData,
        formData: true,
      }),
    }),
    confirmOnboardingResume: builder.mutation<any, { resume_id: string; confirmed_data: string }>({
      query: ({ resume_id, confirmed_data }) => {
        const params = new URLSearchParams();
        params.append("resume_id", resume_id);
        params.append("confirmed_data", confirmed_data);
        return {
          url: "/v1/onboarding/resume/confirm",
          method: "POST",
          body: params.toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        };
      },
      invalidatesTags: ["Onboarding", "Auth"],
    }),
    getProfileOnboardingAnswers: builder.query<OnboardingSectionsResponse, void>({
      query: () => "/v1/users/profile",
      providesTags: ["Onboarding"],
    }),
    updateProfileOnboardingAnswers: builder.mutation<any, any>({
      query: (data) => ({
        url: "/v1/users/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Onboarding", "Auth"],
    }),
    completeProfile: builder.mutation<OnboardingResponse, OnboardingRequest>({
      query: (data) => ({
        url: "/v1/onboarding",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Onboarding", "Auth"],
    }),
    getOnboardingStatus: builder.query<OnboardingStatusResponse, string>({
      query: (user_id) => `/v1/onboarding/${user_id}/status`,
      providesTags: ["Onboarding"],
    }),

    getProfileResume: builder.query<any, void>({
      query: () => "/v1/users/profile/resume",
      providesTags: ["Resume"],
    }),
    updateProfileResume: builder.mutation<any, { parsed_data: any }>({
      query: (body) => ({
        url: "/v1/users/profile/resume",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Resume"],
    }),
  }),
});

export interface OnboardingStatusResponse {
  user_id: string;
  answers_present: boolean;
  resume_present: boolean;
  profile_completed?: boolean;
}

export const {
  useGetGroupedQuestionsQuery,
  useSubmitOnboardingMutation,
  useCompleteProfileMutation,
  useExtractOnboardingResumeMutation,
  useConfirmOnboardingResumeMutation,
  useGetProfileOnboardingAnswersQuery,
  useUpdateProfileOnboardingAnswersMutation,
  useGetOnboardingStatusQuery,
  useLazyGetOnboardingStatusQuery,
  useGetProfileResumeQuery,
  useUpdateProfileResumeMutation,
} = onboardingApi;
