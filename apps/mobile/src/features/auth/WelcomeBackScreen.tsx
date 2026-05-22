import React from "react";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";
import { AuthSuccessScreen } from "./components/AuthSuccessScreen";

export function WelcomeBackScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const name = profile?.name?.split(" ")[0] ?? "there";

  return (
    <AuthSuccessScreen
      title="Welcome Back!"
      subtitle={`Good to see you again, ${name}. You've successfully signed in.`}
      cta="Get Started"
      onCta={() => {
        if (profile?.profile_completed) {
          router.replace("/my-learning" as any);
        } else {
          router.replace("/onboarding");
        }
      }}
    />
  );
}
