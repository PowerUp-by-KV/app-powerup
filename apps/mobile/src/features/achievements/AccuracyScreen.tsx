import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useColorScheme } from "nativewind";

import { useGetAccuracyQuery, type AccuracyScope } from "@/services/gamification-api";

const SCOPES: { key: AccuracyScope; label: string }[] = [
  { key: "learning", label: "Learning" },
  { key: "interview_playground", label: "Interview Playground" },
  { key: "interview_buddy", label: "Interview Buddy" },
];

export function AccuracyScreen() {
  const safeBack = useSafeBack("/(tabs)/achievements");
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<AccuracyScope>("learning");
  const { data, isLoading } = useGetAccuracyQuery(scope);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className={`flex-1 ${isDark ? "bg-[#0F1020]" : "bg-[#F4F5FA]"}`}
    >
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color={isDark ? "#ffffff" : "#1B1F35"} />
        </Pressable>
        <Text
          className={`flex-1 text-center font-bold ${isDark ? "text-white" : "text-[#1B1F35]"}`}
        >
          Accuracy
        </Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        <View
          className={`rounded-3xl p-6 mb-5 items-center border ${
            isDark
              ? "bg-[#1A1B31] border-[rgba(113,116,246,0.15)]"
              : "bg-white border-[#ECEEF8] shadow-sm shadow-[#7174F6]/5"
          }`}
        >
          <Text className={`font-bold mb-1 ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
            Overall Accuracy
          </Text>
          <Text className={`text-xs mb-3 ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
            {data?.overall.total === 0 ? "No data yet" : "You're doing great! Keep up."}
          </Text>
          <View
            className={`w-32 h-32 rounded-full items-center justify-center border-[6px] ${
              isDark ? "bg-[#232540] border-[#7174F6]" : "bg-[#F8F8FF] border-[#7174F6]"
            }`}
          >
            <Text className="text-[#7174F6] text-3xl font-extrabold">
              {data?.overall.percentage ?? 0}%
            </Text>
            <Text className={`text-xs ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
              Accuracy
            </Text>
          </View>
          <View className="flex-row mt-5" style={{ gap: 10 }}>
            <View
              className={`rounded-2xl px-4 py-2 items-center border ${
                isDark
                  ? "bg-[#232540] border-[rgba(113,116,246,0.08)]"
                  : "bg-[#F8F8FF] border-[#ECEEF8]"
              }`}
              style={{ minWidth: 80 }}
            >
              <Text className={`text-xs ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
                Correct
              </Text>
              <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
                {data?.overall.correct ?? 0}
              </Text>
            </View>
            <View
              className={`rounded-2xl px-4 py-2 items-center border ${
                isDark
                  ? "bg-[#232540] border-[rgba(113,116,246,0.08)]"
                  : "bg-[#F8F8FF] border-[#ECEEF8]"
              }`}
              style={{ minWidth: 80 }}
            >
              <Text className={`text-xs ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
                Wrong
              </Text>
              <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
                {data?.overall.wrong ?? 0}
              </Text>
            </View>
            <View
              className={`rounded-2xl px-4 py-2 items-center border ${
                isDark
                  ? "bg-[#232540] border-[rgba(113,116,246,0.08)]"
                  : "bg-[#F8F8FF] border-[#ECEEF8]"
              }`}
              style={{ minWidth: 80 }}
            >
              <Text className={`text-xs ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
                Total
              </Text>
              <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
                {data?.overall.total ?? 0}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row mb-5" style={{ gap: 8 }}>
          {SCOPES.map((s) => {
            const isActive = scope === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setScope(s.key)}
                className={`px-3 py-1.5 rounded-full border ${
                  isActive
                    ? "bg-[#7174F6] border-[#7174F6] shadow-sm shadow-[#7174F6]/25"
                    : isDark
                      ? "bg-[#1A1B31] border-[rgba(113,116,246,0.15)]"
                      : "bg-white border-[#ECEEF8]"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : isDark ? "text-[#B7BED1]" : "text-[#6B7280]"
                  }`}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <ActivityIndicator color="#7174F6" />
        ) : scope === "learning" ? (
          <View
            className={`rounded-2xl p-4 border ${
              isDark
                ? "bg-[#1A1B31] border-[rgba(113,116,246,0.15)]"
                : "bg-white border-[#ECEEF8] shadow-sm shadow-[#7174F6]/5"
            }`}
          >
            <Text className={`font-bold mb-3 ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
              Learning Activity
            </Text>
            {data?.learning_activity.by_skill.map((s) => {
              const w = Math.min(100, Math.max(0, s.score));
              return (
                <View key={s.skill} className="mb-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className={`text-xs ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
                      {s.skill}
                    </Text>
                    <Text className="text-[#7174F6] text-xs font-bold">{s.score}%</Text>
                  </View>
                  <View
                    className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#232540]" : "bg-[#ECEEF8]"}`}
                  >
                    <View className="h-full bg-[#7174F6]" style={{ width: `${w}%` }} />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View
            className={`rounded-2xl p-4 border ${
              isDark
                ? "bg-[#1A1B31] border-[rgba(113,116,246,0.15)]"
                : "bg-white border-[#ECEEF8] shadow-sm shadow-[#7174F6]/5"
            }`}
          >
            <Text className={`font-bold mb-1 ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
              Communication and Behaviour Score
            </Text>
            <Text className={`text-xs ${isDark ? "text-[#8B93A8]" : "text-[#A0A7B8]"}`}>
              {data?.interview_charts.communication.length ?? 0} sessions tracked
            </Text>
            {data?.interview_charts.communication.length === 0 && (
              <Text className={`text-sm mt-3 ${isDark ? "text-[#8B93A8]" : "text-[#A0A7B8]"}`}>
                Complete a mock interview to see your trend.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
