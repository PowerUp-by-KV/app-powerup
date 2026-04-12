import React, { useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGetInterviewHistoryQuery } from "./hooks/useInterviewHistory";
import { SessionCard } from "./components/SessionCard";
import { ReplayViewer } from "./components/ReplayViewer";
import type { SessionHistory } from "./types";

export function InterviewHistoryScreen() {
  const { data: sessions, isLoading, isError, refetch, isFetching } = useGetInterviewHistoryQuery();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const hasSessions = sessions && sessions.length > 0;

  const handleCardPress = (session: SessionHistory) => {
    setSelectedSessionId(session.session_id);
  };

  const closeReplay = () => {
    setSelectedSessionId(null);
  };

  if (selectedSessionId) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
        <ReplayViewer sessionId={selectedSessionId} onClose={closeReplay} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      <View className="flex-1 px-5">
        <View className="mt-5 mb-4">
          <Text className="text-3xl font-extrabold text-slate-900">History</Text>
          <Text className="text-sm text-slate-500 mt-1">Review your past mock interviews</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="warning-outline" size={48} color="#ef4444" />
            <Text className="text-lg font-bold text-slate-900 mt-4">Failed to load history</Text>
            <Text className="text-slate-500 mt-2">Please pull down to try again.</Text>
          </View>
        ) : !hasSessions ? (
          <View className="flex-1 items-center mt-20">
            <Ionicons name="time-outline" size={64} color="#cbd5e1" />
            <Text className="text-lg font-bold text-slate-900 mt-4">No Sessions Yet</Text>
            <Text className="text-slate-500 mt-2 text-center px-4">
              Your completed interviews and their scores will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.session_id}
            renderItem={({ item }) => (
              <SessionCard session={item} onPress={() => handleCardPress(item)} />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
