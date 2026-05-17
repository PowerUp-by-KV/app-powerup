import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";
import {
  useGetModuleDaysQuery,
  useGetModuleEngagementQuery,
  useGetModuleProgressQuery,
  useGetPersonalizedPathQuery,
} from "@/services/module-api";
import { useLearningJourneyGate } from "@/hooks/useLearningJourneyGate";

import { CefrProgressBar } from "./components/CefrProgressBar";
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
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const { data: profile } = useGetProfileQuery();
  const { data: personalizedPath } = useGetPersonalizedPathQuery(undefined, {
    skip: !gate.canEnter,
  });
  const selectedModule = useMemo(() => {
    if (!personalizedPath?.modules.length) return null;
    if (selectedModuleId) {
      return personalizedPath.modules.find((m) => m.id === selectedModuleId) ?? null;
    }
    return null;
  }, [personalizedPath?.modules, selectedModuleId]);
  const { data: days, isLoading: daysLoading } = useGetModuleDaysQuery(selectedModule?.id ?? "", {
    skip: !selectedModule,
  });
  const { data: moduleProgress, refetch: refetchProgress } = useGetModuleProgressQuery(
    selectedModule?.id ?? "",
    { skip: !selectedModule },
  );
  const { data: engagement, refetch: refetchEngagement } = useGetModuleEngagementQuery(
    selectedModule?.id ?? "",
    { skip: !selectedModule },
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (selectedModule) {
        await Promise.all([refetchProgress(), refetchEngagement()]);
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetchProgress, refetchEngagement, selectedModule]);

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
  const completedDays = moduleProgress ? moduleProgress.current_day - 1 : 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 96 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="mb-6">
          <Text className="text-slate-500 text-sm">
            Hi{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          </Text>
          <Text className="text-slate-900 text-3xl font-extrabold mt-1">My Learning</Text>
          <Text className="text-slate-500 mt-1">Track where you&apos;re headed</Text>
        </View>

        {selectedModule ? (
          <Pressable
            onPress={() => setSelectedModuleId(null)}
            className="self-start bg-white border border-slate-200 px-4 py-2 rounded-xl mb-4 active:opacity-70"
          >
            <Text className="text-slate-700 font-bold">Back to modules</Text>
          </Pressable>
        ) : null}

        {selectedModule && engagement ? (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <CefrProgressBar
              currentPct={engagement.cefr_progress_pct}
              nextBand={engagement.next_cefr_band}
              label="CEFR progress"
            />
          </View>
        ) : null}

        {!selectedModule &&
          personalizedPath?.modules.map((module, idx) => (
            <TimelineRow
              key={module.id}
              title={`Module ${module.module_no}: ${module.title}`}
              subtitle={
                module.is_unlocked
                  ? "Tap to view days and activities"
                  : "Locked until previous module is complete"
              }
              state={module.is_unlocked ? "available" : "locked"}
              badgeLabel={module.is_unlocked ? personalizedPath.cefr_band : "Locked"}
              onPress={module.is_unlocked ? () => setSelectedModuleId(module.id) : undefined}
              isLast={idx === personalizedPath.modules.length - 1}
            />
          ))}

        {!selectedModule && personalizedPath && personalizedPath.modules.length === 0 ? (
          <View className="bg-amber-50 rounded-2xl p-4 mt-2">
            <Text className="text-amber-800 text-sm">
              No modules are available yet. Pull to refresh once content is published.
            </Text>
          </View>
        ) : null}

        {selectedModule && daysLoading && (
          <View className="py-6 items-center">
            <ActivityIndicator color="#6366f1" />
          </View>
        )}

        {selectedModule &&
          days?.slice(0, 12)?.map((day, idx) => {
            const dayNumber = idx + 1;
            const isLocked = dayNumber > completedDays + 1;
            const isCompleted = dayNumber <= completedDays;
            const hours = day.duration_hours ?? 0.25;
            const minutes = Math.max(1, Math.round(hours * 60));
            const subtitle = isLocked
              ? `~${minutes} min · locked`
              : isCompleted
                ? `Done · ${minutes} min`
                : `Tap to start · ~${minutes} min`;
            return (
              <TimelineRow
                key={day.id}
                title={`Day ${dayNumber}`}
                subtitle={subtitle}
                state={isLocked ? "locked" : isCompleted ? "completed" : "available"}
                badgeLabel={isLocked ? "Locked" : undefined}
                onPress={
                  isLocked
                    ? undefined
                    : () =>
                        router.push({
                          pathname: `/learning-journey/module/${day.id}` as never,
                          params: { module_id: selectedModule?.id ?? "" },
                        })
                }
                isLast={idx === Math.min(11, totalDays - 1)}
              />
            );
          })}

        {selectedModule && !daysLoading && totalDays === 0 && (
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
