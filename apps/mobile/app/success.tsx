import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthSuccessScreen } from "@/features/auth/components/AuthSuccessScreen";
import { useGetProfileQuery } from "@/services/auth-api";

export default function SuccessScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { data: profile } = useGetProfileQuery();

  const isLogin = mode === "login";

  return (
    <AuthSuccessScreen
      title={isLogin ? "Welcome Back!" : "Success!"}
      subtitle={isLogin ? "You've successfully signed in." : "Action completed successfully."}
      cta="Continue"
      onCta={() => {
        if (profile?.cefr_range) {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding");
        }
      }}
    />
  );
}

