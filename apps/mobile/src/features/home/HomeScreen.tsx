import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetPersonalizedPathQuery, useGetModuleDaysQuery } from "@/services/module-api";

import { WeeklyStreak } from "./components/WeeklyStreak";
import { MyLearningCard } from "./components/MyLearningCard";
import { ContinueLearningCard } from "./components/ContinueLearningCard";
import { FeatureGroupCard } from "./components/FeatureGroupCard";
import { ChatFab } from "./components/ChatFab";

export function HomeScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  const { data: personalizedPath } = useGetPersonalizedPathQuery();

  const filteredModules = useMemo(() => {
    return personalizedPath?.modules.filter((m) => m.module_no !== 0) ?? [];
  }, [personalizedPath?.modules]);

  const activeModule = useMemo(() => {
    if (!filteredModules.length) return null;
    return filteredModules.find((m) => m.is_unlocked) ?? filteredModules[0] ?? null;
  }, [filteredModules]);

  const { data: days } = useGetModuleDaysQuery(activeModule?.id ?? "", {
    skip: !activeModule,
  });

  const activeDay = useMemo(() => {
    if (!days || days.length === 0) return null;
    const incompleteDay = days.find((d) => !d.is_completed);
    return incompleteDay ?? days[days.length - 1] ?? null;
  }, [days]);

  const dayNumber = useMemo(() => {
    if (!days || !activeDay) return 1;
    return days.indexOf(activeDay) + 1;
  }, [days, activeDay]);

  const minutes = useMemo(() => {
    if (!activeDay) return 15;
    const hours = activeDay.duration_hours ?? 0.25;
    return Math.max(1, Math.round(hours * 60));
  }, [activeDay]);

  const handleContinueLearning = () => {
    if (activeModule && activeDay) {
      router.push({
        pathname: `/learning-journey/module/${activeDay.id}` as never,
        params: { module_id: activeModule.id },
      });
    } else {
      router.push("/(tabs)/my-learning" as never);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
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

        <WeeklyStreak days={profile?.weekly_streak} />

        <MyLearningCard
          streakCount={profile?.streak_count ?? 0}
          badgesCount={profile?.badges_count ?? 0}
          xpPoints={profile?.total_xp ?? 0}
          modulesCompleted={profile?.modules_completed ?? 0}
          totalModules={profile?.total_modules ?? null}
          onTrack={() => router.push("/(tabs)/achievements" as never)}
        />

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-slate-900 font-bold text-base">Continue Learning</Text>
          <Pressable onPress={() => router.push("/(tabs)/my-learning" as never)}>
            <Text className="text-indigo-600 text-sm font-semibold">View All</Text>
          </Pressable>
        </View>

        <ContinueLearningCard
          title={activeModule ? activeModule.title : "Public Speaking"}
          subtitle={activeDay ? `Day ${dayNumber} · ⏱ ${minutes} min left` : "⏱ 15 min left"}
          onPress={handleContinueLearning}
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
