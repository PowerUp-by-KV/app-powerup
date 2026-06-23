/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { View, Text } from "react-native";
import type { AssessmentQuestion } from "@/services/assessment-api";

interface SentenceDisplayProps {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeLeft?: number;
}

export function SentenceDisplay({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
}: SentenceDisplayProps) {
  const sentenceText =
    question.sentence ||
    question.text ||
    question.question ||
    question.prompt ||
    question.story ||
    "No sentence text found.";
  const noOfLines = (question as any).noOfLines || question.no_of_lines || 1;
  const recordingTime =
    (question as any).recordingTime ||
    question.recording_time_seconds ||
    (question.complexity === "Advanced" || question.complexity === "Difficult" ? 30 : 15);

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800 dark:text-white">
          Sentence {questionIndex + 1} of {totalQuestions}
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

      <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 mb-4 shadow-sm">
        <Text className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
          Read the sentence:
        </Text>
        <Text className="text-lg text-gray-800 dark:text-white leading-relaxed font-medium">
          {sentenceText}
        </Text>
      </View>

      <View className="flex-row justify-between items-center bg-gray-100 dark:bg-[#1E1F2A] border border-transparent dark:border-slate-800 p-3 rounded-lg">
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          <Text className="font-bold">{noOfLines}</Text> line{noOfLines !== 1 ? "s" : ""}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-600 dark:text-gray-400 mr-2">
            Time:{" "}
            <Text className="font-bold text-gray-900 dark:text-gray-200">{recordingTime}s</Text>
          </Text>
          {timeLeft !== undefined ? (
            <View className="bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded">
              <Text className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">
                Remaining: {timeLeft}s
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
