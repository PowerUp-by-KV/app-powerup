import React from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetModulesQuery, useGetModuleDaysQuery } from "@/services/module-api";
import { useLearningJourneyGate } from "@/hooks/useLearningJourneyGate";

import { TimelineRow } from "./components/TimelineRow";

function GateEmptyState({
  reason,
  onPrimary,
}: {
  reason: "onboarding" | "assessment";
  onPrimary: () => void;
}) {
  const isOnboarding = reason === "onboarding";
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-16 h-16 rounded-3xl bg-indigo-100 items-center justify-center mb-4">
        <Text className="text-3xl">{isOnboarding ? "📝" : "🎯"}</Text>
      </View>
      <Text className="text-slate-900 text-xl font-extrabold mb-2 text-center">
        {isOnboarding ? "Complete your onboarding" : "Take your Diagnostic Assessment"}
      </Text>
      <Text className="text-slate-500 text-center mb-8">
        {isOnboarding
          ? "Answer a few questions so we can build a learning path that fits you."
          : "We need to assess your skills before we can unlock your daily lessons."}
      </Text>
      <Pressable onPress={onPrimary} className="bg-slate-900 px-8 py-4 rounded-2xl active:scale-95">
        <Text className="text-white font-bold text-base">
          {isOnboarding ? "Start onboarding" : "Start assessment"}
        </Text>
      </Pressable>
    </View>
  );
}

export function LearningJourneyScreen() {
  const router = useRouter();
  const gate = useLearningJourneyGate();
  const { data: profile } = useGetProfileQuery();
  const { data: modules } = useGetModulesQuery(undefined, { skip: !gate.canEnter });
  const firstModuleId = modules?.[0]?.id;
  const { data: days, isLoading: daysLoading } = useGetModuleDaysQuery(firstModuleId ?? "", {
    skip: !firstModuleId,
  });

  if (!gate.ready) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  if (!gate.canEnter && gate.blockedReason) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="px-6 pt-12">
          <Text className="text-slate-500 text-sm">
            Hi{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          </Text>
          <Text className="text-slate-900 text-2xl font-extrabold">My Learning</Text>
        </View>
        <GateEmptyState
          reason={gate.blockedReason}
          onPrimary={() =>
            router.push(gate.blockedReason === "onboarding" ? "/dynamic-onboarding" : "/read")
          }
        />
      </SafeAreaView>
    );
  }

  const totalDays = days?.length ?? 0;
  const completedDays = 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 96 }}>
        <View className="mb-6">
          <Text className="text-slate-500 text-sm">
            Hi{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          </Text>
          <Text className="text-slate-900 text-3xl font-extrabold mt-1">My Learning</Text>
          <Text className="text-slate-500 mt-1">Track where you&apos;re headed</Text>
        </View>

        <TimelineRow
          title="Free Content"
          subtitle="The Fundamentals of Communication"
          state="completed"
          badgeLabel="Completed"
          progressPercent={100}
          progressLabel="8 lessons completed · 350 XP"
        />
        <TimelineRow
          title="Trial Content"
          subtitle="Behaviour in Workplace"
          state="completed"
          badgeLabel="Completed"
          progressPercent={100}
          progressLabel="7 lessons completed · 250 XP"
        />
        <TimelineRow
          title="Diagnostic Assessment"
          subtitle="Assessing your skills"
          state={profile?.cefr_range ? "completed" : "in_progress"}
          badgeLabel={profile?.cefr_range ? profile.cefr_range : "In Progress"}
          progressPercent={profile?.cefr_range ? 100 : 70}
          progressLabel={profile?.cefr_range ? "Complete" : "3 lessons completed"}
          onPress={() => router.push("/read")}
        />

        {daysLoading && (
          <View className="py-6 items-center">
            <ActivityIndicator color="#6366f1" />
          </View>
        )}

        {days?.slice(0, 12).map((day, idx) => {
          const dayNumber = idx + 1;
          const isLocked = dayNumber > completedDays + 1;
          return (
            <TimelineRow
              key={day.id}
              title={`Day ${dayNumber}`}
              subtitle={isLocked ? "Complete previous stages to unlock" : "Tap to start"}
              state={
                isLocked ? "locked" : dayNumber === completedDays + 1 ? "available" : "completed"
              }
              badgeLabel={isLocked ? "Locked" : undefined}
              onPress={
                isLocked
                  ? undefined
                  : () => router.push(`/learning-journey/module/${day.id}` as never)
              }
              isLast={idx === Math.min(11, totalDays - 1)}
            />
          );
        })}

        {!daysLoading && totalDays === 0 && (
          <View className="bg-amber-50 rounded-2xl p-4 mt-2">
            <Text className="text-amber-800 text-sm">
              No daily lessons available yet. Pull to refresh once content is published.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
