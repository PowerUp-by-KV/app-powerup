import React, { useMemo } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useGetProfileQuery } from "@/services/auth-api";
import { getAvatarUri } from "@/utils/avatar";
import { useLearningJourneyGate } from "@/hooks/useLearningJourneyGate";
import {
  useGetProgressionQuery,
  useGetModuleDaysQuery,
  useGetDayProgressQuery,
} from "@/services/module-api";

import { WeeklyStreak } from "./components/WeeklyStreak";
import { MyLearningCard } from "./components/MyLearningCard";
import { ContinueLearningCard } from "./components/ContinueLearningCard";
import { FeatureGroupCard } from "./components/FeatureGroupCard";
import { ChatFab } from "./components/ChatFab";
import { VerifyEmailBanner } from "./components/VerifyEmailBanner";

export function HomeScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const gate = useLearningJourneyGate();

  const { data: progression } = useGetProgressionQuery(undefined, {
    skip: !gate.canEnter,
  });

  const activeModule = useMemo(() => {
    if (!progression?.unlocked_modules?.length) return null;
    const current = progression.unlocked_modules.find((m) => !m.locked && !m.completed);
    if (current) return current;
    const firstUnlocked = progression.unlocked_modules.find((m) => !m.locked);
    if (firstUnlocked) return firstUnlocked;
    return progression.unlocked_modules[0];
  }, [progression?.unlocked_modules]);

  const { data: days } = useGetModuleDaysQuery(activeModule?.module_id ?? "", {
    skip: !activeModule,
  });

  const activeProgressionModule = useMemo(() => {
    if (!progression?.unlocked_modules || !activeModule) return null;
    return progression.unlocked_modules.find((m) => m.module_id === activeModule.module_id);
  }, [progression?.unlocked_modules, activeModule]);

  const unlockedDays = useMemo(() => {
    return activeProgressionModule?.unlocked_days ?? [1, 2, 3, 4, 5, 6];
  }, [activeProgressionModule]);

  const daysCompleted = useMemo(() => {
    if (!days) return 0;
    return days.filter((d) => unlockedDays.includes(d.day_number) && d.is_completed).length;
  }, [days, unlockedDays]);

  const totalDays = useMemo(() => {
    return unlockedDays.length;
  }, [unlockedDays]);

  const activeDay = useMemo(() => {
    if (!days) return null;
    const firstIncomplete = days.find((d) => !d.is_completed);
    return firstIncomplete ?? days[0] ?? null;
  }, [days]);

  const { data: dayProgress } = useGetDayProgressQuery(activeDay?.id ?? "", {
    skip: !activeDay,
  });

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  const handleContinuePress = () => {
    if (!gate.canEnter) {
      if (gate.blockedReason === "onboarding") {
        router.push("/onboarding");
      } else {
        router.push("/(tabs)/my-learning" as never);
      }
      return;
    }

    if (activeDay && activeModule) {
      router.push({
        pathname: `/learning-journey/module/${activeDay.id}` as never,
        params: { module_id: activeModule.module_id },
      });
    } else {
      router.push("/(tabs)/my-learning" as never);
    }
  };

  const continueTitle = activeModule
    ? `${activeModule.title} (Day ${activeDay?.day_number ?? 1})`
    : "Continue Learning";

  const continueSubtitle = useMemo(() => {
    if (!activeDay) return "⏱ 15 min left";
    if (dayProgress) {
      const mins = dayProgress.estimated_minutes_remaining;
      return mins > 0 ? `⏱ ${mins} min left` : "Start today's activities";
    }
    return "Resume daily activities";
  }, [activeDay, dayProgress]);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#faf5ff", "#f5f3ff", "#fafafd"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }} className="flex-1">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-black tracking-tight">
                <Text style={{ color: "#4f46e5" }}>Hi, </Text>
                <Text style={{ color: "#94a3b8" }}>
                  {(firstName?.toUpperCase() || "").slice(0, 2)}
                </Text>
                <Text style={{ color: "#84cc16" }}>
                  {(firstName?.toUpperCase() || "").slice(2)}!
                </Text>
              </Text>
              <Text className="text-slate-400 text-sm mt-1 font-semibold">
                Ready to learn something new?
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/profile" as never)}
              className="w-12 h-12 rounded-full bg-white border border-indigo-100 items-center justify-center shadow-sm shadow-indigo-100 active:scale-95"
            >
              <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center overflow-hidden">
                {profile?.avatar_id ? (
                  <Image
                    source={{ uri: getAvatarUri(profile.avatar_id, profile.id) }}
                    className="w-full h-full"
                  />
                ) : (
                  <Feather name="user" size={20} color="#4f46e5" />
                )}
              </View>
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
            daysCompleted={daysCompleted}
            totalDays={totalDays}
            onTrack={() => router.push("/(tabs)/achievements" as never)}
          />

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-900 font-bold text-base">Continue Learning</Text>
            <Pressable onPress={() => router.push("/(tabs)/my-learning" as never)}>
              <Text className="text-indigo-600 text-sm font-semibold">View All</Text>
            </Pressable>
          </View>

          <ContinueLearningCard
            title={continueTitle}
            subtitle={continueSubtitle}
            onPress={handleContinuePress}
          />

          <FeatureGroupCard
            title="Convo Coach"
            subtitle="Say it better, every time"
            icon="✨"
            items={[
              {
                title: "Interview Playground",
                subtitle: "Try, learn and improve — No pressure",
                onPress: () => router.push("/interview-playground" as never),
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
                onPress: () => router.push("/resume-buddy" as never),
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
    </View>
  );
}
