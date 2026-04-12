import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetMockInterviewResultQuery } from "@/services/interviewApiSlice";

interface ReplayViewerProps {
  sessionId: string;
  onClose: () => void;
}

export function ReplayViewer({ sessionId, onClose }: ReplayViewerProps) {
  const { data, isLoading, isError } = useGetMockInterviewResultQuery(sessionId);

  return (
    <View className="flex-1 bg-slate-50 mt-4 rounded-t-3xl border border-slate-200">
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200 bg-white rounded-t-3xl">
        <View className="flex-row items-center">
          <Ionicons name="recording" size={24} color="#ef4444" />
          <Text className="ml-2 font-bold text-lg text-slate-900">Q&A Replay</Text>
        </View>
        <Ionicons name="close" size={28} color="#64748b" onPress={onClose} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : isError || !data ? (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-slate-500 font-medium">Failed to load replay data.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {data.gapAnalysis ? (
            <View className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <Text className="font-bold text-blue-900 mb-1">Gap Analysis</Text>
              <Text className="text-blue-800 leading-5">{data.gapAnalysis}</Text>
            </View>
          ) : null}

          <Text className="font-bold text-slate-800 text-base mb-3">Response Breakdown</Text>
          {data.responses.map((response, index) => (
            <View
              key={index}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-100"
            >
              <View className="flex-row mb-2">
                <Text className="font-bold text-slate-400 mr-2">Q{index + 1}.</Text>
                <Text className="font-semibold text-slate-900 flex-1 leading-5">
                  {response.questionText}
                </Text>
              </View>

              <View className="bg-slate-50 rounded-lg p-3 my-2 border border-slate-100">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                  Your Answer
                </Text>
                <Text className="text-slate-700 italic">&quot;{response.userAnswer}&quot;</Text>
              </View>

              {response.feedback ? (
                <View className="mt-2">
                  <Text className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">
                    Feedback
                  </Text>
                  <Text className="text-green-800 text-sm">{response.feedback}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
