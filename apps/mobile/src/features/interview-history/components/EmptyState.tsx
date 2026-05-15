/**
 * EmptyState Component - Empty state placeholder for interview history
 * Displays when no practice sessions exist yet
 */

import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";

interface EmptyStateProps {
  onStartInterview: () => void;
}

export function EmptyState({ onStartInterview }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-6 h-[120px] w-[120px] items-center justify-center rounded-full bg-slate-100">
        <MaterialIcons name="history" size={72} color="#cbd5e1" />
      </View>

      <Text className="mb-3 text-center text-[22px] font-bold text-slate-800">
        No Interviews Yet
      </Text>

      <Text className="mb-8 max-w-[320px] text-center text-[15px] leading-[22px] text-slate-500">
        Start your first mock interview to see your practice history and track your progress over
        time.
      </Text>

      <Pressable
        className="w-full max-w-[260px] items-center rounded-xl bg-blue-600 px-8 py-4 active:bg-blue-700"
        onPress={onStartInterview}
      >
        <Text className="text-lg font-semibold text-white">Start Mock Interview</Text>
      </Pressable>
    </View>
  );
}
