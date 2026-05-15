import React from "react";
import { useRouter } from "expo-router";

import { AuthSuccessScreen } from "./components/AuthSuccessScreen";

export function ThankYouScreen() {
  const router = useRouter();
  return (
    <AuthSuccessScreen
      title="Thank You!"
      subtitle="Your account has been successfully created"
      cta="Continue"
      onCta={() => router.replace("/dynamic-onboarding")}
    />
  );
}
