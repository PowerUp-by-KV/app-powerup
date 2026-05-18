import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useStartSessionMutation, getNextRouteForSection } from "@/services/assessment-api";
import { saveAssessmentSessionId } from "@/services/auth-storage";
import { useLearningJourneyGate } from "@/hooks/useLearningJourneyGate";

import { CefrProgressBar } from "./components/CefrProgressBar";
import { TimelineRow } from "./components/TimelineRow";

function GateEmptyState({
  reason,
  onPrimary,
  isLoading = false,
}: {
  reason: "onboarding" | "assessment";
  onPrimary: () => void;
  isLoading?: boolean;
}) {
  const isOnboarding = reason === "onboarding";
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingVertical: 64,
      }}
      showsVerticalScrollIndicator={false}
    >
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
      <Pressable
        onPress={onPrimary}
        disabled={isLoading}
        className={`px-8 py-4 rounded-2xl active:scale-95 ${isLoading ? "bg-slate-400" : "bg-slate-900"}`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-base">
            {isOnboarding ? "Start onboarding" : "Start assessment"}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

export function LearningJourneyScreen() {
  const router = useRouter();
  const gate = useLearningJourneyGate();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [startSession] = useStartSessionMutation();
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
      <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  if (!gate.canEnter && gate.blockedReason) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-slate-50">
        <View className="px-6 pt-12 mb-4">
          <Text className="text-slate-500 text-sm">
            Hi{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          </Text>
          <Text className="text-slate-900 text-2xl font-extrabold">My Learning</Text>
        </View>
        <GateEmptyState
          reason={gate.blockedReason}
          onPrimary={async () => {
            if (gate.blockedReason === "onboarding") {
              router.push("/onboarding");
              return;
            }
            setIsStartingSession(true);
            try {
              const session = await startSession().unwrap();
              await saveAssessmentSessionId(session.session_id);
              const firstRoute = getNextRouteForSection(session.first_section);
              router.push({ pathname: firstRoute, params: { session_id: session.session_id } });
            } catch {
              Alert.alert("Error", "Could not start assessment. Please try again.");
            } finally {
              setIsStartingSession(false);
            }
          }}
          isLoading={isStartingSession}
        />
      </SafeAreaView>
    );
  }

  const totalDays = days?.length ?? 0;
  const completedDays = moduleProgress ? moduleProgress.current_day - 1 : 0;

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-slate-50">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <Text className="text-slate-700 font-bold">Back to roadmap</Text>
          </Pressable>
        ) : null}

        {selectedModule && engagement ? (
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100">
            <CefrProgressBar
              currentPct={engagement.cefr_progress_pct}
              nextBand={engagement.next_cefr_band}
              label="CEFR progress"
            />
          </View>
        ) : null}

        {!selectedModule && (
          <View className="mt-2">
            <TimelineRow
              title="Pre Assesment"
              subtitle="Master the fundamentals"
              state="completed"
              iconOverride="check"
              badgeLabel="Completed"
              progressPercent={100}
              progressLabel="8 lessons completed"
              xpLabel="350 XP earned"
              onPress={() => {
                Alert.alert(
                  "Diagnostic Assessment Completed",
                  `Your evaluated CEFR Level is: ${personalizedPath?.cefr_band || profile?.cefr_range || "B1-B2"}\nKeep learning to advance your English mastery!`,
                  [{ text: "Awesome!" }],
                );
              }}
            />

            <TimelineRow
              title="CEFR Score"
              subtitle="Challenge yourself"
              state="in_progress"
              iconOverride="edit-2"
              badgeLabel="In Progress"
              progressPercent={70}
              progressLabel="5 lessons completed"
              xpLabel="210 XP earned"
              buttonLabel="Continue Learning"
              onButtonPress={() => {
                const firstModule = personalizedPath?.modules?.[0];
                if (firstModule) {
                  setSelectedModuleId(firstModule.id);
                } else {
                  setSelectedModuleId("1f79a741-1ca8-48da-84a7-9dc6d7e88f98");
                }
              }}
              onPress={() => {
                const firstModule = personalizedPath?.modules?.[0];
                if (firstModule) {
                  setSelectedModuleId(firstModule.id);
                } else {
                  setSelectedModuleId("1f79a741-1ca8-48da-84a7-9dc6d7e88f98");
                }
              }}
            />

            <TimelineRow
              title="Post Assesment"
              subtitle="Craft effective messages"
              state="locked"
              iconOverride="edit-2"
              badgeLabel="Locked"
              progressLabel="Complete previous stages to unlock"
            />

            <TimelineRow
              title="Resume option"
              subtitle="Optimize your Resume"
              state="locked"
              iconOverride="lock"
              badgeLabel="Locked"
              progressLabel="Complete previous stages to unlock"
              isLast={true}
            />
          </View>
        )}

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
