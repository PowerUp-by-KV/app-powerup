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
      className="bg-white rounded-3xl p-5 border border-slate-100 mb-4 flex-row items-center active:scale-[0.98] shadow-sm shadow-slate-100"
    >
      <View className="w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center mr-3.5 shadow-sm shadow-indigo-100/20">
        <Feather name="book-open" size={22} color="#ffffff" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-bold text-base">{title}</Text>
        <Text className="text-slate-500 text-xs mt-1">{subtitle}</Text>
      </View>
      <View
        style={{ backgroundColor: "#bef264" }}
        className="w-10 h-10 rounded-full items-center justify-center shadow-sm shadow-lime-300/30"
      >
        <Feather name="chevron-right" size={22} color="#1a202c" />
      </View>
    </Pressable>
  );
}

