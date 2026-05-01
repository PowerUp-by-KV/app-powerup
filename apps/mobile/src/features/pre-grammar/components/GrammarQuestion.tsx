import React from "react";
import { View, Text } from "react-native";
import { GrammarQuestion as IGrammarQuestion } from "../types";

interface GrammarQuestionProps {
  question: IGrammarQuestion;
  questionIndex: number;
  totalQuestions: number;
}

export function GrammarQuestion({ question, questionIndex, totalQuestions }: GrammarQuestionProps) {
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

      <View className="flex-row items-center mb-4">
        <View className="bg-purple-600 rounded-lg px-3 py-1 mr-2">
          <Text className="text-white text-xs font-bold">{question.topic}</Text>
        </View>
        <Text className="text-xs text-gray-600">{question.questionType}</Text>
      </View>

      <View className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
        <Text className="text-base text-gray-800 leading-relaxed">{question.question}</Text>
      </View>
    </View>
  );
}
