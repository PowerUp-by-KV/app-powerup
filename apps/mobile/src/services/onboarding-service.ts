import { api } from "@/utils/api";

export type OnboardingPayload = {
  name: string;
  mobile: string;
  dob: string;
  college: string;
};

export const submitOnboarding = async (payload: OnboardingPayload) => {
  const response = await api.post("/onboarding", payload);
  return response.data;
};
