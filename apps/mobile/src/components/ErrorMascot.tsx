import React from "react";
import { Text, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { useSafeBack } from "@/hooks/useSafeBack";

interface ErrorMascotProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showBackButton?: boolean;
}

export function ErrorMascot({
  title = "Something went wrong",
  message = "An error occurred while loading this page. Please try again.",
  onRetry,
  showBackButton = true,
}: ErrorMascotProps) {
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-white items-center justify-center px-6"
    >
      <View
        style={{
          width: 280,
          height: 280,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LottieView
          source={require("../../assets/mascot/Error 404.lottie")}
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <Text className="text-slate-900 font-extrabold text-2xl text-center mt-6">{title}</Text>
      <Text className="text-slate-500 font-medium text-sm text-center mt-2 mb-8 max-w-[80%]">
        {message}
      </Text>
      <View className="flex-row gap-4">
        {showBackButton && (
          <Pressable
            onPress={() => safeBack()}
            className="px-6 py-3 bg-slate-100 rounded-full active:scale-95 transition-transform"
          >
            <Text className="text-slate-700 font-bold text-sm">GO BACK</Text>
          </Pressable>
        )}
        {onRetry && (
          <Pressable
            onPress={onRetry}
            className="px-6 py-3 bg-indigo-600 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <Text className="text-white font-bold text-sm">RETRY</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
