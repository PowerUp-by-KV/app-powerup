/**
 * ResponseCard Component - Displays a single Q&A response in the detail view
 * Shows question text, user answer, optional audio indicator, AI feedback, and score
 */

import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import type { PracticeResponse } from "@/services/interview-api";

interface ResponseCardProps {
  response: PracticeResponse;
  index: number;
}

export function ResponseCard({ response, index }: ResponseCardProps) {
  return (
    <View className="mb-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Question Number + Score */}
      <View className="mb-3.5 flex-row items-center justify-between">
        <View className="rounded-full bg-blue-50 px-3 py-1">
          <Text className="text-[13px] font-bold text-blue-600">Q{index + 1}</Text>
        </View>

        {response.score !== undefined && response.score !== null && (
          <View className="flex-row items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
            <MaterialIcons name="star" size={14} color="#f59e0b" />
            <Text className="text-[13px] font-bold text-amber-700">{response.score}</Text>
          </View>
        )}
      </View>

      {/* Question */}
      <View className="mb-3.5">
        <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Question
        </Text>
        <Text className="text-[15px] font-semibold leading-[22px] text-slate-800">
          {response.question_text}
        </Text>
      </View>

      {/* User Answer */}
      <View className="mb-3.5">
        <View className="mb-1.5 flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your Answer
          </Text>
          {response.audio_url && (
            <View className="flex-row items-center gap-1 rounded-xl bg-violet-50 px-2 py-0.5">
              <MaterialIcons name="mic" size={14} color="#7c3aed" />
              <Text className="text-[11px] font-semibold text-violet-600">Audio</Text>
            </View>
          )}
        </View>
        <View className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
          <Text className="text-sm leading-5 text-slate-600">{response.user_answer}</Text>
        </View>
      </View>

      {/* AI Feedback */}
      {response.ai_feedback && (
        <View>
          <View className="mb-1.5 flex-row items-center gap-1.5">
            <MaterialIcons name="smart-toy" size={16} color="#2563eb" />
            <Text className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              AI Feedback
            </Text>
          </View>
          <View className="rounded-[10px] border border-blue-200 bg-blue-50 p-3">
            <Text className="text-sm leading-5 text-blue-800">{response.ai_feedback}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
