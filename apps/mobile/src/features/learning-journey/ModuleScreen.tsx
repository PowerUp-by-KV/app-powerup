import React, { useEffect, useState, useMemo } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useSafeBack } from "@/hooks/useSafeBack";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { OfflineGameView } from "@/components/OfflineGameView";

import {
  useCompleteActivityMutation,
  useGetActivityQuestionsQuery,
  useGetDayActivitiesQuery,
  useGetModuleEngagementQuery,
  useLazyGetProgressionQuery,
} from "@/services/module-api";

import { ActivityRenderer, ActivityResult } from "./components/ActivityRenderer";

export function ModuleScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const params = useLocalSearchParams<{
    day_id?: string;
    module_id?: string;
    day_number?: string;
  }>();
  const dayId = params.day_id ?? "";
  const moduleId = params.module_id ?? "";

  const {
    data: activities = [],
    isLoading: actsLoading,
    isFetching: actsFetching,
    isError: actsError,
    refetch: refetchActivities,
  } = useGetDayActivitiesQuery(dayId, {
    skip: !dayId,
  });
  const activitiesToPlay = useMemo(() => {
    const incomplete = activities.filter((act) => !act.passed);
    return incomplete.length > 0 ? incomplete : activities;
  }, [activities]);

  const [activityIdx, setActivityIdx] = useState(0);

  useEffect(() => {
    setActivityIdx(0);
  }, [activities]);

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
  const { data: moduleEngagement, refetch: refetchModuleEngagement } = useGetModuleEngagementQuery(
    moduleId,
    { skip: !moduleId },
  );
  const initialModuleXpRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (initialModuleXpRef.current === null && moduleEngagement?.xp_earned != null) {
      initialModuleXpRef.current = moduleEngagement.xp_earned;
    }
  }, [moduleEngagement?.xp_earned]);

  const [triggerProgression] = useLazyGetProgressionQuery();

  const tryRefreshProgression = async () => {
    // Try a few times with short delays to let backend settle; stop early if unlocks appear.
    for (let i = 0; i < 3; i++) {
      try {
        const resp = await triggerProgression();
        const prog = resp?.data;
        if (prog && Array.isArray(prog.unlocked_modules)) {
          const moduleEntries = prog.unlocked_modules.filter((m) => m.module_id === moduleId);
          const anyNextDays = moduleEntries
            .flatMap((m) => m.unlocked_days ?? [])
            .some((d) => d > 6);
          if (anyNextDays) return true;
        }
      } catch (e) {
        // ignore and retry
      }
      // wait before next try
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 700));
    }
    return false;
  };

  const handleActivityComplete = async (result: ActivityResult) => {
    if (!currentActivity || isCompleting) return;
    setIsCompleting(true);
    try {
      const res = await completeActivity({
        activity_id: currentActivity.id,
        body: { passed: result.passed, score: result.score },
      }).unwrap();

      // If the day just completed, jump to the celebration screen.
      if (res.day_completed) {
        // Attempt to compute day-level XP: prefer server-returned `res.xp_earned`
        // when available; otherwise compute the delta from module engagement.
        let dayXp = res.xp_earned ?? 0;

        if (!dayXp) {
          try {
            const refreshed = await refetchModuleEngagement();
            const latestXp = refreshed?.data?.xp_earned ?? moduleEngagement?.xp_earned ?? 0;
            const previousXp = initialModuleXpRef.current ?? 0;
            const delta = Math.max(0, latestXp - previousXp);
            if (delta > 0) {
              dayXp = delta;
              // update the saved baseline for future days
              initialModuleXpRef.current = latestXp;
            }
          } catch (e) {
            // ignore — fall back to res.xp_earned (which may be 0)
          }
        }

        // Give progression a short chance to update so the UI can show newly unlocked days.
        // This will return quickly if nothing changed.
        // eslint-disable-next-line no-await-in-loop
        await tryRefreshProgression();

        router.replace({
          // The day-complete route is generated by expo-router on next build;
          // cast keeps TS happy until typegen catches up.
          pathname: "/learning-journey/day-complete" as never,
          params: {
            day_number: params.day_number || String(res.module_check_result ? "12" : ""),
            module_id: moduleId,
            xp_earned: String(dayXp ?? 0),
            module_check_score: res.module_check_result
              ? String(res.module_check_result.score_pct)
              : "",
            ready_to_advance: res.module_check_result?.ready_to_advance ? "1" : "0",
            next_cefr: res.module_check_result?.next_cefr ?? "",
            current_cefr: res.module_check_result?.current_cefr ?? "",
            at_ceiling: res.module_check_result?.at_ceiling ? "1" : "0",
          },
        });
        return;
      }

      if (activityIdx + 1 < activitiesToPlay.length) {
        setActivityIdx(activityIdx + 1);
      } else {
        safeBack();
      }
    } catch {
      // Soft-fail: still advance the local UX so the user isn't stuck.
      if (activityIdx + 1 < activitiesToPlay.length) {
        setActivityIdx(activityIdx + 1);
      } else {
        safeBack();
      }
    } finally {
      setIsCompleting(false);
    }
  };

  if (!dayId) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-slate-500">Missing day id.</Text>
      </SafeAreaView>
    );
  }

  const isError = (actsError || qError) && !actsFetching && !qFetching;

  if (isError) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="p-6"
      >
        <View className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-sm items-center justify-center">
          <LottieView
            source={require("../../../assets/mascot/Error 404.lottie")}
            autoPlay
            loop
            style={{ width: 140, height: 140, marginBottom: 12 }}
          />

          <Text className="text-slate-900 font-extrabold text-xl text-center mb-2">
            Server Connection Lost
          </Text>
          <Text className="text-slate-500 text-sm text-center leading-5 mb-4">
            We couldn't connect to the learning server. Please ensure the backend service is running
            and try again.
          </Text>

          {/* Inline Arcade Offline Game (Chrome Dino Style) */}
          <OfflineGameView />

          <View className="w-full gap-3">
            <Pressable
              onPress={handleRetry}
              className="w-full bg-slate-900 active:bg-slate-800 py-4 rounded-xl items-center justify-center shadow-sm"
            >
              <Text className="text-white font-extrabold text-sm">Try Again</Text>
            </Pressable>

            <Pressable
              onPress={() => safeBack()}
              className="w-full bg-slate-100 active:bg-slate-200 py-4 rounded-xl items-center justify-center"
            >
              <Text className="text-slate-700 font-extrabold text-sm">Go Back</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (actsLoading || qLoading || actsFetching || qFetching || isCompleting || !currentActivity) {
    return <GamifiedMascotLoader title="Loading Activities..." />;
  }

  const totalSteps = activitiesToPlay.length;
  const currentStep = activityIdx + 1;
  const progressPct = Math.min(100, Math.round((currentStep / Math.max(1, totalSteps)) * 100));

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="x" size={22} color="#0f172a" />
        </Pressable>
        <View className="flex-1 mx-4">
          <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <View className="h-full bg-slate-900" style={{ width: `${progressPct}%` }} />
          </View>
        </View>
        <Text className="text-xs text-slate-500 w-12 text-right">
          {currentStep}/{totalSteps}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <ActivityRenderer
          activity={currentActivity}
          questions={questions}
          onComplete={handleActivityComplete}
        />
      </View>
    </SafeAreaView>
  );
}
