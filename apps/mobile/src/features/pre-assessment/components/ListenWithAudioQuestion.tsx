/* eslint-disable @typescript-eslint/no-explicit-any */
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
        <Text className="text-lg font-bold text-gray-800 dark:text-white">
          Question {questionIndex + 1} of {totalQuestions}
        </Text>
        <Text
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            question.complexity === "Easy"
              ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
              : question.complexity === "Medium"
                ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400"
                : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
          }`}
        >
          {question.complexity || "Standard"}
        </Text>
      </View>

      <View className="bg-gray-100 dark:bg-[#1E1F2A] border border-transparent dark:border-slate-800 p-4 rounded-lg mb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Max Recording: {recordingTime}s
          </Text>
          {noOfLines ? (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Content Lines: {noOfLines}
            </Text>
          ) : null}
        </View>
        {timeLeft !== undefined ? (
          <View className="bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-lg">
            <Text className="text-xs text-red-600 dark:text-red-400 font-bold">
              Ends in: {timeLeft}s
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
