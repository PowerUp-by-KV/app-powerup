import React from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useGetProfileQuery } from "@/services/auth-api";

import { WeeklyStreak } from "./components/WeeklyStreak";
import { MyLearningCard } from "./components/MyLearningCard";
import { ContinueLearningCard } from "./components/ContinueLearningCard";
import { FeatureGroupCard } from "./components/FeatureGroupCard";
import { ChatFab } from "./components/ChatFab";
import { VerifyEmailBanner } from "./components/VerifyEmailBanner";

export function HomeScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-slate-50">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-slate-900 text-xl font-extrabold">Hi, {firstName}!</Text>
            <Text className="text-slate-500 text-sm mt-0.5">Ready to learn something new?</Text>
          </View>
          <Pressable
            onPress={() => router.push("/profile" as never)}
            className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center"
          >
            <Feather name="user" size={20} color="#475569" />
          </Pressable>
        </View>

        {profile && profile.email_verified === false && (
          <VerifyEmailBanner email={profile.email} />
        )}

        <WeeklyStreak days={profile?.weekly_streak} />

        <MyLearningCard
          streakCount={profile?.streak_count ?? 0}
          badgesCount={profile?.badges_count ?? 0}
          xpPoints={profile?.total_xp ?? 0}
          modulesCompleted={profile?.modules_completed ?? 0}
          totalModules={profile?.total_modules ?? null}
          onTrack={() => router.push("/(tabs)/my-learning" as never)}
        />

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-slate-900 font-bold text-base">Continue Learning</Text>
          <Pressable onPress={() => router.push("/(tabs)/my-learning" as never)}>
            <Text className="text-indigo-600 text-sm font-semibold">View All</Text>
          </Pressable>
        </View>

        <ContinueLearningCard
          title="Public Speaking"
          subtitle="⏱ 15 min left"
          onPress={() => router.push("/(tabs)/my-learning" as never)}
        />

        <FeatureGroupCard
          title="Convo Coach"
          subtitle="Say it better, every time"
          icon="✨"
          items={[
            {
              title: "Interview Playground",
              subtitle: "Try, learn and improve — No pressure",
              onPress: () => router.push("/mock-interview" as never),
            },
            {
              title: "Interview Buddy",
              subtitle: "Practice with a buddy before it counts",
              onPress: () => router.push("/ai-interview" as never),
            },
          ]}
        />

        <FeatureGroupCard
          title="Resume Studio"
          subtitle="Build a resume you're proud to share"
          icon="📝"
          items={[
            {
              title: "Resume Buddy",
              subtitle: "Know what recruiters notice",
              onPress: () => router.push("/resume" as never),
            },
            {
              title: "Craft your Resume",
              subtitle: "Design your story, your way",
              onPress: () => router.push("/resume" as never),
            },
          ]}
        />
      </ScrollView>
      <ChatFab onPress={() => router.push("/chat" as never)} />
    </SafeAreaView>
  );
}
