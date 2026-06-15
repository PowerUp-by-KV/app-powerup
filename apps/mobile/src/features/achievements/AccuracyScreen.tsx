import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetAccuracyQuery, type AccuracyScope } from "@/services/gamification-api";

const SCOPES: { key: AccuracyScope; label: string }[] = [
  { key: "learning", label: "Learning" },
  { key: "interview_playground", label: "Interview Playground" },
  { key: "interview_buddy", label: "Interview Buddy" },
];

export function AccuracyScreen() {
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<AccuracyScope>("learning");
  const { data, isLoading } = useGetAccuracyQuery(scope);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Accuracy</Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        <View className="bg-slate-100 rounded-3xl p-6 mb-5 items-center">
          <Text className="text-slate-900 font-bold mb-1">Overall Accuracy</Text>
          <Text className="text-slate-500 text-xs mb-3">
            {data?.overall.total === 0 ? "No data yet" : "You're doing great! Keep up."}
          </Text>
          <View
            className="w-32 h-32 rounded-full bg-white items-center justify-center"
            style={{ borderWidth: 6, borderColor: "#0f172a" }}
          >
            <Text className="text-slate-900 text-3xl font-extrabold">
              {data?.overall.percentage ?? 0}%
            </Text>
            <Text className="text-slate-500 text-xs">Accuracy</Text>
          </View>
          <View className="flex-row mt-5" style={{ gap: 10 }}>
            <View className="bg-white rounded-2xl px-4 py-2 items-center" style={{ minWidth: 80 }}>
              <Text className="text-slate-500 text-xs">Correct</Text>
              <Text className="text-slate-900 font-bold text-lg">{data?.overall.correct ?? 0}</Text>
            </View>
            <View className="bg-white rounded-2xl px-4 py-2 items-center" style={{ minWidth: 80 }}>
              <Text className="text-slate-500 text-xs">Wrong</Text>
              <Text className="text-slate-900 font-bold text-lg">{data?.overall.wrong ?? 0}</Text>
            </View>
            <View className="bg-white rounded-2xl px-4 py-2 items-center" style={{ minWidth: 80 }}>
              <Text className="text-slate-500 text-xs">Total</Text>
              <Text className="text-slate-900 font-bold text-lg">{data?.overall.total ?? 0}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row mb-5" style={{ gap: 8 }}>
          {SCOPES.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setScope(s.key)}
              className={`px-3 py-1.5 rounded-full ${scope === s.key ? "bg-slate-900" : "bg-slate-100"}`}
            >
              <Text
                className={`text-xs font-bold ${scope === s.key ? "text-white" : "text-slate-600"}`}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : scope === "learning" ? (
          <View className="bg-slate-50 rounded-2xl p-4">
            <Text className="text-slate-900 font-bold mb-3">Learning Activity</Text>
            {data?.learning_activity.by_skill.map((s) => {
              const w = Math.min(100, Math.max(0, s.score));
              return (
                <View key={s.skill} className="mb-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-slate-700 text-xs">{s.skill}</Text>
                    <Text className="text-slate-500 text-xs">{s.score}%</Text>
                  </View>
                  <View className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <View className="h-full bg-slate-900" style={{ width: `${w}%` }} />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="bg-slate-50 rounded-2xl p-4">
            <Text className="text-slate-900 font-bold mb-1">Communication and Behaviour Score</Text>
            <Text className="text-slate-500 text-xs">
              {data?.interview_charts.communication.length ?? 0} sessions tracked
            </Text>
            {data?.interview_charts.communication.length === 0 && (
              <Text className="text-slate-400 text-sm mt-3">
                Complete a mock interview to see your trend.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
