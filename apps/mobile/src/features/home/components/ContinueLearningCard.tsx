import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ContinueLearningCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function ContinueLearningCard({ title, subtitle, onPress }: ContinueLearningCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-3xl p-4 border border-slate-100 mb-4 flex-row items-center active:opacity-80"
    >
      <View className="w-10 h-10 rounded-2xl bg-indigo-100 items-center justify-center mr-3">
        <Feather name="book-open" size={20} color="#4f46e5" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-bold">{title}</Text>
        <Text className="text-slate-500 text-xs mt-0.5">{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#94a3b8" />
    </Pressable>
  );
}
