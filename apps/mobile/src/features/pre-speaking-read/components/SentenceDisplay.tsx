import React from "react";
import { View, Text } from "react-native";
import type { AssessmentQuestion } from "@/services/assessment-api";

interface SentenceDisplayProps {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
}

export function SentenceDisplay({ question, questionIndex, totalQuestions }: SentenceDisplayProps) {
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

      <View className="bg-gradient-to-b from-blue-50 to-blue-100 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
        <Text className="text-sm text-blue-600 font-semibold mb-2">Read the sentence:</Text>
        <Text className="text-lg text-gray-800 leading-relaxed font-medium">
          {question.sentence ||
            question.question ||
            question.text ||
            question.prompt ||
            question.story ||
            "No sentence text found."}
        </Text>
      </View>

      <View className="flex-row justify-between items-center bg-gray-100 p-3 rounded-lg">
        <Text className="text-xs text-gray-600">
          <Text className="font-bold">{question.no_of_lines || 1}</Text> line
          {(question.no_of_lines || 1) !== 1 ? "s" : ""}
        </Text>
        <Text className="text-xs text-gray-600">
          Time:{" "}
          <Text className="font-bold">
            {question.recording_time_seconds ||
              (question.complexity === "Advanced" || question.complexity === "Difficult" ? 30 : 15)}
            s
          </Text>
        </Text>
      </View>
    </View>
  );
}
