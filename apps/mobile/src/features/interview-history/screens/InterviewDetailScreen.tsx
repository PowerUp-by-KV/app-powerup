/**
 * Interview Detail Screen
 * Question-by-question replay of a practice session with user response and AI feedback.
 * Reads sessionId from route params and finds the matching session from cached RTK Query data.
 */

import React from "react";
import { View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useGetPracticeHistoryQuery } from "@/services/interview-api";
import { ResponseCard } from "../components/ResponseCard";
import { getStatusConfig, formatDetailDate } from "../constants";

export function InterviewDetailScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: sessions, isLoading, error, refetch } = useGetPracticeHistoryQuery();

  const session = sessions?.find((s) => s.session_id === sessionId);
  const statusCfg = getStatusConfig(session?.status);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-[15px] text-slate-500">Loading session details...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <MaterialIcons name="error-outline" size={56} color="#ef4444" />
        <Text className="mb-2 mt-4 text-xl font-bold text-slate-800">Failed to Load Session</Text>
        <Text className="mb-6 max-w-[300px] text-center text-sm leading-5 text-slate-500">
          Something went wrong while loading this session. Please try again.
        </Text>
        <Pressable
          className="flex-row items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 active:bg-blue-700"
          onPress={refetch}
        >
          <MaterialIcons name="refresh" size={20} color="#ffffff" />
          <Text className="text-[15px] font-semibold text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Session not found
  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <MaterialIcons name="search-off" size={56} color="#94a3b8" />
        <Text className="mb-2 mt-4 text-xl font-bold text-slate-800">Session Not Found</Text>
        <Text className="mb-6 max-w-[300px] text-center text-sm leading-5 text-slate-500">
          This practice session could not be found. It may have been removed.
        </Text>
        <Pressable
          className="flex-row items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 active:bg-blue-700"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={20} color="#ffffff" />
          <Text className="text-[15px] font-semibold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const responses = session.responses || [];

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-5 pb-10">
      {/* Back Navigation */}
      <Pressable className="mb-5 flex-row items-center gap-1.5" onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={22} color="#3b82f6" />
        <Text className="text-[15px] font-semibold text-blue-500">Back to History</Text>
      </Pressable>

      {/* Session Header Card */}
      <View className="mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <Text className="mb-1 text-2xl font-extrabold text-slate-900">Session Replay</Text>
        <Text className="mb-4 text-sm text-slate-500">{formatDetailDate(session.created_at)}</Text>

        {/* Stats Row */}
        <View className="flex-row items-center justify-center rounded-xl bg-slate-50 px-5 py-3.5">
          <View className="flex-1 items-center gap-1">
            <MaterialIcons name="question-answer" size={20} color="#3b82f6" />
            <Text className="text-base font-bold text-slate-800">{session.response_count}</Text>
            <Text className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Responses
            </Text>
          </View>

          <View className="mx-4 h-9 w-px bg-slate-200" />

          <View className="flex-1 items-center gap-1">
            <MaterialIcons name={statusCfg.icon} size={20} color={statusCfg.color} />
            <Text className="text-base font-bold capitalize text-slate-800">{statusCfg.label}</Text>
            <Text className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Status
            </Text>
          </View>
        </View>
      </View>

      {/* Responses */}
      {responses.length === 0 ? (
        <View className="items-center py-12">
          <MaterialIcons name="inbox" size={40} color="#cbd5e1" />
          <Text className="mt-3 text-sm text-slate-400">
            No responses recorded for this session.
          </Text>
        </View>
      ) : (
        <View>
          {responses.map((response, index) => (
            <ResponseCard key={response.response_id} response={response} index={index} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
