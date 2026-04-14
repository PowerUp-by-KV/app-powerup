import React from "react";
import { View, Text } from "react-native";

export function OAuthRedirectCard() {
  return (
    <View className="w-full max-w-[420px] bg-white/95 rounded-[32px] p-8 border border-slate-300/25 shadow-2xl backdrop-blur-xl">
      <Text className="text-2xl font-bold text-slate-900 mb-3">Finishing Google sign-in</Text>
      <Text className="text-base text-slate-600 leading-relaxed">
        Please wait while we complete your authentication and redirect you into the app.
      </Text>
    </View>
  );
}
