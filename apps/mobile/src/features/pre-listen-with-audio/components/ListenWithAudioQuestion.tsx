import React from "react";
import { View, Text } from "react-native";
import { ListenWithAudioQuestion as IListenWithAudioQuestion } from "../types";

interface ListenWithAudioQuestionProps {
  question: IListenWithAudioQuestion;
  questionIndex: number;
  totalQuestions: number;
}

export function ListenWithAudioQuestion({
  question,
  questionIndex,
  totalQuestions,
}: ListenWithAudioQuestionProps) {
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

      <View className="bg-gray-100 p-4 rounded-lg mb-3">
        <Text className="text-sm text-gray-600 mb-2">
          Audio Duration: {question.audioDuration}s
        </Text>
        <Text className="text-sm text-gray-600">Content Lines: {question.noOfLines}</Text>
      </View>
    </View>
  );
}
