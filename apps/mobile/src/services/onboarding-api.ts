import { api } from "./api";

export interface OnboardingSubmissionRequest {
  name: string;
  mobile: string;
  dob: string;
  college: string;
}

export interface OnboardingResult {
  success: boolean;
  message: string;
}

export const onboardingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    submitOnboarding: builder.mutation<OnboardingResult, OnboardingSubmissionRequest>({
      query: (data) => ({
        url: "/onboarding/submit",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Onboarding"],
    }),
  }),
});

export const { useSubmitOnboardingMutation } = onboardingApi;
