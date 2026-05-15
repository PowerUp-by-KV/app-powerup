import React from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetResumeScoreQuery } from "@/services/resume-api";

function ScoreRing({ score, label }: { score: number; label: string }) {
  return (
    <View className="items-center" style={{ width: 96 }}>
      <View
        className="w-20 h-20 rounded-full items-center justify-center bg-white"
        style={{ borderWidth: 5, borderColor: "#0f172a" }}
      >
        <Text className="text-slate-900 font-extrabold text-base">{score}%</Text>
      </View>
      <Text className="text-slate-700 text-xs mt-2 text-center" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

export function ResumeScoreScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const userId = profile?.id ?? "";
  const { data, isLoading, isError, error } = useGetResumeScoreQuery(userId, { skip: !userId });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Resume Score</Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : isError ? (
          <View className="bg-amber-50 rounded-2xl p-6 items-center">
            <Feather name="upload-cloud" size={28} color="#d97706" />
            <Text className="text-amber-900 font-bold mt-3 text-center">
              No resume uploaded yet
            </Text>
            <Text className="text-amber-700 text-sm mt-1 text-center">
              Upload your resume from the Resume Studio to see your score breakdown.
            </Text>
            <Pressable
              onPress={() => router.replace("/resume" as never)}
              className="mt-5 bg-slate-900 rounded-full px-6 py-3"
            >
              <Text className="text-white font-bold text-sm">Go to Resume Studio</Text>
            </Pressable>
            {error && typeof error === "object" && "data" in error ? null : null}
          </View>
        ) : (
          <>
            <Text className="text-slate-900 text-xl font-extrabold mb-1 text-center">
              You&apos;re half way to a great start!
            </Text>
            <Text className="text-slate-500 text-center mb-6">
              Overall score: {data?.overall_score ?? 0}%
            </Text>

            <View className="flex-row flex-wrap justify-center mb-6" style={{ gap: 14 }}>
              {data?.sections.map((s) => (
                <ScoreRing
                  key={s.key}
                  score={Math.round((s.score / Math.max(1, s.max)) * 100)}
                  label={s.label}
                />
              ))}
              <ScoreRing score={data?.overall_score ?? 0} label="Overall Score" />
            </View>

            <Text className="text-slate-500 text-xs mb-3 text-center">
              Here&apos;s what you got right and areas we&apos;ll help improve
            </Text>

            <View className="bg-slate-50 rounded-2xl p-4 mb-3 border border-slate-100">
              <View className="flex-row items-center mb-2">
                <Feather name="award" size={16} color="#0f172a" />
                <Text className="text-slate-900 font-bold ml-2">You got it right</Text>
              </View>
              {(data?.got_right ?? []).map((b) => (
                <View key={b} className="flex-row items-start mt-1">
                  <Feather name="check" size={12} color="#22c55e" />
                  <Text className="text-slate-700 text-sm ml-2 flex-1">{b}</Text>
                </View>
              ))}
            </View>

            <View className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <View className="flex-row items-center mb-2">
                <Feather name="zap" size={16} color="#0f172a" />
                <Text className="text-slate-900 font-bold ml-2">How we&apos;ll help improve</Text>
              </View>
              {(data?.improvements ?? []).map((b) => (
                <View key={b} className="flex-row items-start mt-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                  <Text className="text-slate-700 text-sm ml-2 flex-1">{b}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => router.replace("/resume" as never)}
              className="bg-slate-900 rounded-full py-4 items-center"
            >
              <Text className="text-white font-bold">Continue</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
