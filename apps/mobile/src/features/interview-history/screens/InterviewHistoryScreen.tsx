/**
 * Interview History Screen
 * Displays a list of all past practice sessions with status and response counts.
 * Uses RTK Query to fetch from GET /api/v1/practice/history
 */

import React, { useCallback } from "react";
import { View, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useGetPracticeHistoryQuery, type PracticeSession } from "@/services/interview-api";
import { SessionCard } from "../components/SessionCard";
import { EmptyState } from "../components/EmptyState";

export function InterviewHistoryScreen() {
  const router = useRouter();
  const { data: sessions, isLoading, isFetching, error, refetch } = useGetPracticeHistoryQuery();

  const handleStartInterview = useCallback(() => {
    router.push("/quiz");
  }, [router]);

  const handleViewSession = useCallback(
    (sessionId: string) => {
      router.push(`/interview-detail?sessionId=${sessionId}`);
    },
    [router],
  );

  const renderSessionItem = useCallback(
    ({ item }: { item: PracticeSession }) => (
      <SessionCard session={item} onPress={() => handleViewSession(item.session_id)} />
    ),
    [handleViewSession],
  );

  const keyExtractor = useCallback((item: PracticeSession) => item.session_id, []);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-[15px] text-slate-500">Loading practice history...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <MaterialIcons name="error-outline" size={56} color="#ef4444" />
        <Text className="mb-2 mt-4 text-xl font-bold text-slate-800">Failed to Load History</Text>
        <Text className="mb-6 max-w-[300px] text-center text-sm leading-5 text-slate-500">
          Something went wrong while fetching your practice history. Please try again.
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

  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <FlatList
        data={[]}
        renderItem={null}
        className="flex-1 bg-slate-50"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState onStartInterview={handleStartInterview} />}
      />
    );
  }

  // List view
  return (
    <FlatList
      data={sessions}
      renderItem={renderSessionItem}
      keyExtractor={keyExtractor}
      className="flex-1 bg-slate-50"
      contentContainerClassName="p-5 pb-10"
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      ListHeaderComponent={
        <View className="mb-5">
          <Text className="mb-1 text-[26px] font-extrabold text-slate-900">Practice History</Text>
          <Text className="text-sm text-slate-500">
            {sessions.length} {sessions.length === 1 ? "session" : "sessions"} recorded
          </Text>
        </View>
      }
    />
  );
}
