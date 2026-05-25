import React from "react";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetOnboardingStatusQuery } from "@/services/onboarding-api";
import { AuthSuccessScreen } from "./components/AuthSuccessScreen";

export function WelcomeBackScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const { data: onboardingStatus } = useGetOnboardingStatusQuery(profile?.id ?? "", {
    skip: !profile?.id,
  });
  const name = profile?.name?.split(" ")[0] ?? "there";
  const isComplete = onboardingStatus?.profile_completed || profile?.profile_completed;

  return (
    <AuthSuccessScreen
      title="Welcome Back!"
      subtitle={`Good to see you again, ${name}. You've successfully signed in.`}
      cta="Get Started"
      onCta={() => {
        if (isComplete) {
          router.replace("/my-learning" as any);
        } else {
          router.replace("/onboarding");
        }
      }}
    />
  );
}
