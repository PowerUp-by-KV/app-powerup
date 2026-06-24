import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

interface ContinueLearningCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function ContinueLearningCard({ title, subtitle, onPress }: ContinueLearningCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white dark:bg-[#16161c] border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-5 mb-4 shadow-sm shadow-slate-100 dark:shadow-none active:scale-[0.98]"
    >
      <LinearGradient
        colors={isDark ? ["#3b82f6", "#2563eb"] : ["#4f46e5", "#3b82f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-12 h-12 rounded-[16px] items-center justify-center mr-3.5 shadow-sm shadow-indigo-100 dark:shadow-none"
      >
        <Feather name="book-open" size={22} color="#ffffff" />
      </LinearGradient>
      <View className="flex-1">
        <Text className="text-slate-900 dark:text-white font-bold text-base">{title}</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">{subtitle}</Text>
      </View>
      <View className="bg-[#bef264] w-10 h-10 rounded-full items-center justify-center shadow-sm shadow-[#bef264]/20">
        <Feather name="chevron-right" size={22} color="#1a202c" />
      </View>
    </Pressable>
  );
}
