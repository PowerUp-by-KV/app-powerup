import React from "react";
import { View, Text } from "react-native";
import { SpeakingQuestion as ISpeakingQuestion } from "../types";

interface SpeakingQuestionProps {
  question: ISpeakingQuestion;
  questionIndex: number;
  totalQuestions: number;
}

export function SpeakingQuestion({
  question,
  questionIndex,
  totalQuestions,
}: SpeakingQuestionProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">
          Question {questionIndex + 1} of {totalQuestions}
        </Text>
        <Text
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            question.complexity === "Easy"
              ? "bg-green-100 text-green-700"
              : question.complexity === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {question.complexity}
        </Text>
      </View>

      <View className="bg-blue-50 p-4 rounded-lg mb-4">
        {question.topic && (
          <Text className="text-sm font-semibold text-blue-900 mb-2">Topic: {question.topic}</Text>
        )}
        <Text className="text-base text-gray-800 leading-relaxed">{question.question}</Text>
      </View>

      <View className="bg-gray-100 p-3 rounded-lg">
        <Text className="text-xs text-gray-600">
          Recording Time: {question.recordingTime} seconds
        </Text>
      </View>
    </View>
  );
}
