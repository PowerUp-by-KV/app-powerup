import React from "react";
import { View, Text } from "react-native";
import { ListeningQuestion as IListeningQuestion } from "../types";

interface ListeningQuestionProps {
  question: IListeningQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeLeft?: number;
}

export function ListeningQuestion({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
}: ListeningQuestionProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">
          Story {questionIndex + 1} of {totalQuestions}
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
          {question.complexity || "Medium"}
        </Text>
      </View>

      <View className="bg-gray-100 p-4 rounded-lg mb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-600 mb-1">
            Time Allotted:{" "}
            {question.recordingTime || (question as any).recording_time_seconds || 45}s
          </Text>
          {(question.noOfLines || (question as any).no_of_lines) && (
            <Text className="text-sm text-gray-600">
              Content Lines: {question.noOfLines || (question as any).no_of_lines}
            </Text>
          )}
        </View>
        {timeLeft !== undefined && (
          <View className="bg-red-50 px-3 py-1 rounded-lg">
            <Text className="text-xs text-red-600 font-bold">Ends in: {timeLeft}s</Text>
          </View>
        )}
      </View>
    </View>
  );
}
