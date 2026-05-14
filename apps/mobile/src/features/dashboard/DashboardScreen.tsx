import React from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";
import { useStartSessionMutation } from "@/services/assessment-api";

export function DashboardScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetProfileQuery();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();

  const handleRetake = async () => {
    try {
      const session = await startSession().unwrap();
      router.push({ pathname: "/read", params: { session_id: session.session_id } } as never);
    } catch {
      router.push("/read" as never);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="mb-8">
          <Text className="text-slate-500 text-base">Welcome,</Text>
          <Text className="text-slate-900 text-3xl font-extrabold mt-1">
            {profile?.name ?? "Learner"}
          </Text>
          {profile?.cefr_range ? (
            <View className="mt-3 self-start bg-indigo-100 px-4 py-1.5 rounded-full">
              <Text className="text-indigo-700 font-bold tracking-wider">
                CEFR · {profile.cefr_range}
              </Text>
            </View>
          ) : (
            <Text className="mt-3 text-slate-400 text-sm">
              Complete the assessment to see your level.
            </Text>
          )}
        </View>

        <View className="flex-row gap-4 mb-10">
          <View className="flex-1 bg-amber-50 rounded-3xl p-5">
            <Text className="text-amber-700 text-xs font-bold tracking-wider uppercase">
              Streak
            </Text>
            <Text className="text-amber-900 text-3xl font-extrabold mt-1">
              🔥 {profile?.streak_count ?? 0}
            </Text>
            <Text className="text-amber-700 text-xs mt-1">days in a row</Text>
          </View>
          <View className="flex-1 bg-emerald-50 rounded-3xl p-5">
            <Text className="text-emerald-700 text-xs font-bold tracking-wider uppercase">XP</Text>
            <Text className="text-emerald-900 text-3xl font-extrabold mt-1">
              ⭐ {profile?.total_xp ?? 0}
            </Text>
            <Text className="text-emerald-700 text-xs mt-1">total points</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/quiz/present-simple-quiz" as never)}
          className="bg-indigo-600 rounded-2xl py-5 mb-4 active:scale-95"
        >
          <Text className="text-white text-center text-lg font-bold">Start Learning</Text>
        </Pressable>

        <Pressable
          onPress={handleRetake}
          disabled={isStarting}
          className="bg-slate-100 rounded-2xl py-5 active:scale-95"
        >
          <Text className="text-slate-700 text-center text-base font-semibold">
            {isStarting ? "Starting…" : "Retake Assessment"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
