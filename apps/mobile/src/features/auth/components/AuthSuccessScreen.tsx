import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

interface AuthSuccessScreenProps {
  title: string;
  subtitle: string;
  cta: string;
  onCta: () => void;
}

export function AuthSuccessScreen({ title, subtitle, cta, onCta }: AuthSuccessScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-white dark:bg-[#18181b]"
    >
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-[#3b82f6] items-center justify-center mb-6 shadow-md shadow-blue-100 dark:shadow-none">
          <Feather name="check" size={28} color="#fff" />
        </View>
        <Text className="text-slate-900 dark:text-white text-3xl font-extrabold mb-3 text-center">
          {title}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-base text-center mb-12 px-6">
          {subtitle}
        </Text>
        <Pressable
          onPress={onCta}
          className="bg-[#3b82f6] rounded-2xl py-4 items-center w-full active:opacity-85 shadow-lg shadow-blue-200"
        >
          <Text className="text-white font-bold text-base">{cta}</Text>
        </Pressable>
      </View>
    </View>
  );
}
