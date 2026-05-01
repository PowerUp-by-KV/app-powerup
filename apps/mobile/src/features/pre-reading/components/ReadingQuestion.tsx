import React from "react";
import { View, Text } from "react-native";

interface ReadingQuestionProps {
  question: string;
  questionIndex: number;
  totalQuestions: number;
}

export function ReadingQuestion({ question, questionIndex, totalQuestions }: ReadingQuestionProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm font-semibold text-gray-500">
          Question {questionIndex + 1} of {totalQuestions}
        </Text>
        <View className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500"
            style={{
              width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </View>
      </View>
      <Text className="text-lg font-bold text-gray-900">{question}</Text>
    </View>
  );
}
