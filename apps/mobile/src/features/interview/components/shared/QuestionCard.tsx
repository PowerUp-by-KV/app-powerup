import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  onReplay?: () => void;
  isLoading?: boolean;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  onReplay,
  isLoading = false,
}: QuestionCardProps) {
  return (
    <View className="bg-white rounded-2xl p-5 w-full shadow-md mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-blue-100 px-3 py-1.5 rounded-full flex-row items-center">
          <MaterialCommunityIcons name="lightbulb" size={14} color="#2563EB" />
          <Text className="text-xs font-semibold text-blue-600 ml-1">
            Question {questionNumber} of {totalQuestions}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onReplay}
          disabled={isLoading}
          className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center"
        >
          <MaterialCommunityIcons name="volume-high" size={16} color="#334155" />
        </TouchableOpacity>
      </View>
      <Text className="text-lg font-bold text-gray-900 leading-6">{questionText}</Text>
    </View>
  );
}
