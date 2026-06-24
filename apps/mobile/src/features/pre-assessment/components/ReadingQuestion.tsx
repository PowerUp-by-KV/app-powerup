import React from "react";
import { View, Text } from "react-native";

interface ReadingQuestionProps {
  question: string;
  questionIndex: number;
  totalQuestions: number;
  timeLeft?: number;
}

export function ReadingQuestion({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
}: ReadingQuestionProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Question {questionIndex + 1} of {totalQuestions}
        </Text>
        <View className="flex-row items-center">
          {timeLeft !== undefined && (
            <View className="bg-red-50 px-2 py-0.5 rounded mr-3">
              <Text className="text-xs text-red-600 font-bold">{timeLeft}s</Text>
            </View>
          )}
          <View className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-blue-500"
              style={{
                width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </View>
        </View>
      </View>
      <Text className="text-lg font-bold text-gray-900 dark:text-white">{question}</Text>
    </View>
  );
}
