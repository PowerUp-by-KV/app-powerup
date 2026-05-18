import React from "react";
import { View, Text } from "react-native";
import type { AssessmentQuestion } from "@/services/assessment-api";

interface ListenWithAudioQuestionProps {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeLeft?: number;
}

export function ListenWithAudioQuestion({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
}: ListenWithAudioQuestionProps) {
  const recordingTime = (question as any).recordingTime || question.recording_time_seconds || 30;
  const noOfLines = (question as any).noOfLines || question.no_of_lines;

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
          {question.complexity || "Standard"}
        </Text>
      </View>

      <View className="bg-gray-100 p-4 rounded-lg mb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-600 mb-1">Max Recording: {recordingTime}s</Text>
          {noOfLines ? (
            <Text className="text-sm text-gray-600">Content Lines: {noOfLines}</Text>
          ) : null}
        </View>
        {timeLeft !== undefined ? (
          <View className="bg-red-50 px-3 py-1 rounded-lg">
            <Text className="text-xs text-red-600 font-bold">Ends in: {timeLeft}s</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
