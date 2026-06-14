/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { View, Text } from "react-native";
import type { AssessmentQuestion } from "@/services/assessment-api";

interface SpeakingQuestionProps {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeLeft?: number;
}

export function SpeakingQuestion({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
}: SpeakingQuestionProps) {
  const recordingTime =
    (question as any).recordingTime ||
    question.recording_time_seconds ||
    (question as any).time_seconds ||
    30;

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

      {question.topic ? (
        <View className="bg-indigo-50 px-3 py-1.5 rounded-full self-start mb-3">
          <Text className="text-xs font-semibold text-indigo-700">{question.topic}</Text>
        </View>
      ) : null}

      <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
        <Text className="text-sm text-gray-500 font-semibold mb-1">Prompt / Question:</Text>
        <Text className="text-base text-gray-800 leading-relaxed">
          {question.question || question.prompt || question.text}
        </Text>
      </View>

      <View className="flex-row justify-between items-center bg-gray-100 p-3 rounded-lg">
        <Text className="text-xs text-gray-600">Recording Time: {recordingTime} seconds</Text>
        {timeLeft !== undefined ? (
          <View className="bg-indigo-100 px-2 py-0.5 rounded">
            <Text className="text-xs text-indigo-700 font-bold">Remaining: {timeLeft}s</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
