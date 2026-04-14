import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { OAuthRedirectCard } from "./components/OAuthRedirectCard";
import { useOAuthRedirect } from "./hooks/useOAuthRedirect";

export function OAuthRedirectScreen() {
  const { isLoading } = useOAuthRedirect();

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6 py-10">
      <OAuthRedirectCard />

      <View className="mt-8 items-center">
        {isLoading && <ActivityIndicator size="large" color="#7c3aed" />}
        <Text className="text-slate-300 text-center mt-4 max-w-[280px]">
          Completing Google sign-in and redirecting you to continue.
        </Text>
      </View>
    </View>
  );
}
