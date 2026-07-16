import React, { useEffect, useState, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

import { useSafeBack } from "@/hooks/useSafeBack";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { OfflineGameView } from "@/components/OfflineGameView";
import { LinearGradient } from "expo-linear-gradient";

import {
  useCompleteActivityMutation,
  useGetActivityQuestionsQuery,
  useGetDayActivitiesQuery,
  useGetModuleEngagementQuery,
} from "@/services/module-api";
import type { Activity } from "@powerup/shared";

import { ActivityRenderer, ActivityResult } from "./components/ActivityRenderer";

export function ModuleScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams<{
    day_id?: string;
    module_id?: string;
    day_number?: string;
    retake_activity_id?: string;
  }>();
  const dayId = params.day_id ?? "";
  const moduleId = params.module_id ?? "";

  const {
    data: rawActivities = [],
    isLoading: actsLoading,
    isFetching: actsFetching,
    isError: actsError,
    refetch: refetchActivities,
  } = useGetDayActivitiesQuery(dayId, {
    skip: !dayId,
  });

  const activities = useMemo(() => {
    if (!rawActivities) return [];
    return [...rawActivities].sort((a, b) => {
      return (a.order_index ?? 0) - (b.order_index ?? 0);
    });
  }, [rawActivities]);

  const [activitiesToPlay, setActivitiesToPlay] = useState<Activity[]>([]);
  const [hasInitializedList, setHasInitializedList] = useState(false);
  const [initialPassedCount, setInitialPassedCount] = useState<number | null>(null);

  useEffect(() => {
    if (activities.length > 0 && !hasInitializedList) {
      if (params.retake_activity_id) {
        const retake = activities.filter((act) => act.id === params.retake_activity_id);
        if (retake.length > 0) {
          setActivitiesToPlay(retake);
          setHasInitializedList(true);
          return;
        }
      }
      const incomplete = activities.filter((act) => !act.passed);
      setActivitiesToPlay(incomplete.length > 0 ? incomplete : activities);
      const passedCount = activities.filter((act) => act.passed).length;
      setInitialPassedCount(passedCount);
      setHasInitializedList(true);
    }
  }, [activities, hasInitializedList, params.retake_activity_id]);

  const [activityIdx, setActivityIdx] = useState(0);

  const currentActivity = activitiesToPlay[activityIdx];

  const {
    data: questions = [],
    isLoading: qLoading,
    isFetching: qFetching,
    isError: qError,
    refetch: refetchQuestions,
  } = useGetActivityQuestionsQuery(currentActivity?.id ?? "", {
    skip: !currentActivity,
  });

  const handleRetry = () => {
    refetchActivities();
    if (currentActivity) {
      refetchQuestions();
    }
  };

  const [completeActivity] = useCompleteActivityMutation();
  const [isCompleting, setIsCompleting] = useState(false);

  // Track module XP when the user opens the module so we can compute
  // the per-day XP delta if the backend doesn't return per-activity xp.
  const { data: moduleEngagement } = useGetModuleEngagementQuery(moduleId, { skip: !moduleId });
  const initialModuleXpRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (initialModuleXpRef.current === null && moduleEngagement?.xp_earned != null) {
      initialModuleXpRef.current = moduleEngagement.xp_earned;
    }
  }, [moduleEngagement?.xp_earned]);

  const handleActivityComplete = async (result: ActivityResult) => {
    if (!currentActivity || isCompleting) return;
    setIsCompleting(true);
    try {
      const skill = String(currentActivity.skill_type || "").toLowerCase();
      const isAsync = skill === "speaking" || skill === "writing";

      if (!isAsync) {
        await completeActivity({
          activity_id: currentActivity.id,
          body: { passed: result.passed, score: result.score },
        }).unwrap();
      }

      const earned =
        moduleEngagement?.xp_earned != null && initialModuleXpRef.current != null
          ? Math.max(0, moduleEngagement.xp_earned - initialModuleXpRef.current)
          : 0;

      if (activityIdx + 1 < activitiesToPlay.length) {
        setActivityIdx(activityIdx + 1);
      } else {
        router.replace({
          pathname: "/learning-journey/day-complete" as never,
          params: {
            day_id: dayId,
            module_id: moduleId,
            day_number: params.day_number || "",
            xp_earned: String(earned || 20),
          },
        });
      }
    } catch {
      // Soft-fail: still advance the local UX so the user isn't stuck.
      const earned =
        moduleEngagement?.xp_earned != null && initialModuleXpRef.current != null
          ? Math.max(0, moduleEngagement.xp_earned - initialModuleXpRef.current)
          : 0;

      if (activityIdx + 1 < activitiesToPlay.length) {
        setActivityIdx(activityIdx + 1);
      } else {
        router.replace({
          pathname: "/learning-journey/day-complete" as never,
          params: {
            day_id: dayId,
            module_id: moduleId,
            day_number: params.day_number || "",
            xp_earned: String(earned || 20),
          },
        });
      }
    } finally {
      setIsCompleting(false);
    }
  };

  if (!dayId) {
    return (
      <View
        style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }}
        className="flex-1 bg-white items-center justify-center"
      >
        <Text className="text-slate-500">Missing day id.</Text>
      </View>
    );
  }

  if (actsError || qError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#0e0e11" : "#f8fafc",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
        className="p-6"
      >
        <View className="w-full max-w-sm bg-white dark:bg-[#1e1f2a] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm items-center justify-center">
          <View
            style={{
              width: 140,
              height: 140,
              marginBottom: 12,
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LottieView
              source={require("../../../assets/mascot/Error 404.lottie")}
              autoPlay
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </View>

          <Text className="text-slate-900 dark:text-white font-extrabold text-xl text-center mb-2">
            Server Connection Lost
          </Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-sm text-center leading-5 mb-4">
            We couldn't connect to the learning server. Please ensure the backend service is running
            and try again.
          </Text>

          {/* Inline Arcade Offline Game (Chrome Dino Style) */}
          <OfflineGameView />

          <View className="w-full gap-3">
            <Pressable
              onPress={handleRetry}
              className="w-full bg-slate-900 dark:bg-zinc-100 active:bg-slate-800 dark:active:bg-zinc-200 py-4 rounded-xl items-center justify-center shadow-sm"
            >
              <Text className="text-white dark:text-zinc-900 font-extrabold text-sm">
                Try Again
              </Text>
            </Pressable>

            <Pressable
              onPress={() => safeBack()}
              className="w-full bg-slate-100 dark:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700 py-4 rounded-xl items-center justify-center"
            >
              <Text className="text-slate-700 dark:text-zinc-300 font-extrabold text-sm">
                Go Back
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (
    actsLoading ||
    activitiesToPlay.length === 0 ||
    qLoading ||
    actsFetching ||
    qFetching ||
    isCompleting ||
    !currentActivity
  ) {
    let loaderTitle = "Loading Activities...";
    if (isCompleting) {
      loaderTitle = "Saving Progress...";
    } else if (qLoading || qFetching) {
      loaderTitle = "Loading Questions...";
    }
    return <GamifiedMascotLoader title={loaderTitle} />;
  }

  const totalSteps = activities.length;
  const absoluteIndex = currentActivity
    ? activities.findIndex((a) => a.id === currentActivity.id)
    : -1;

  const passedCount = activities.filter((act) => act.passed).length;
  const basePassedCount = initialPassedCount ?? passedCount;

  // Determine current step based on the activity's absolute index in the module.
  const currentStep = absoluteIndex !== -1 ? absoluteIndex + 1 : activityIdx + 1;

  const progressPct = Math.min(
    100,
    Math.round(
      ((absoluteIndex !== -1 ? absoluteIndex : basePassedCount + activityIdx) /
        Math.max(1, totalSteps)) *
        100,
    ),
  );

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-white dark:bg-[#0e0e11]"
    >
      <View className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#0e0e11]">
        {/* Top Header Row with Close 'X' and Horizontal Progress Bar */}
        <View className="flex-row items-center w-full mb-3">
          <Pressable
            onPress={() => safeBack()}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1F2A] border border-slate-100 dark:border-slate-800 items-center justify-center shadow-sm active:opacity-85"
          >
            <Feather name="x" size={20} color={isDark ? "#ffffff" : "#0f172a"} />
          </Pressable>
          <View className="flex-1 h-2 bg-slate-200/80 dark:bg-zinc-800 rounded-full ml-4 overflow-hidden">
            <LinearGradient
              colors={["#3b82f6", "#22c55e"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${progressPct}%` }}
              className="h-full rounded-full"
            />
          </View>
        </View>

        {/* Section details with Category title and progress count */}
        <View className="flex-row items-center justify-between px-1 mb-1">
          <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
            {currentActivity?.skill_type || "Activity"}
          </Text>
          <View className="bg-slate-100/80 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-slate-200/40 dark:border-zinc-800">
            <Text className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400">
              Activity {currentStep} of {totalSteps}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ActivityRenderer
          activity={currentActivity}
          questions={questions}
          onComplete={handleActivityComplete}
        />
      </View>
    </View>
  );
}
