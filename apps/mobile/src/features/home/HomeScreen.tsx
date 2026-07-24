import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, Text, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { useThemeToggle } from "@/hooks/useThemeToggle";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ModuleDay } from "@powerup/shared";

import { useGetProfileQuery } from "@/services/auth-api";
import { getAvatarUri } from "@/utils/avatar";
import { useLearningJourneyGate } from "@/hooks/useLearningJourneyGate";
import {
  useLazyGetModuleDaysQuery,
  useGetDayProgressQuery,
  useGetModulesQuery,
} from "@/services/module-api";
import { useGetResumeStatusQuery } from "@/services/resume-api";
import { usePlanTier } from "@/hooks/usePlanTier";

export interface CombinedModuleDay extends ModuleDay {
  module_no: number;
  module_title: string;
  module_id: string;
}

import { WeeklyStreak } from "./components/WeeklyStreak";
import { MyLearningCard } from "./components/MyLearningCard";
import { ContinueLearningCard } from "./components/ContinueLearningCard";
import { FeatureGroupCard } from "./components/FeatureGroupCard";
import { ChatFab } from "./components/ChatFab";
import { VerifyEmailBanner } from "./components/VerifyEmailBanner";
import { showAlert } from "@/utils/alert";

const PROGRESSION_WAVES = [
  { wave: 1, modules: [1, 5, 9], days: [1, 2, 3, 4, 5, 6] },
  { wave: 2, modules: [1, 5, 9], days: [7, 8, 9, 10, 11, 12] },
  { wave: 3, modules: [2, 6, 10], days: [1, 2, 3, 4, 5, 6] },
  { wave: 4, modules: [2, 6, 10], days: [7, 8, 9, 10, 11, 12] },
  { wave: 5, modules: [3, 7, 11], days: [1, 2, 3, 4, 5, 6] },
  { wave: 6, modules: [3, 7, 11], days: [7, 8, 9, 10, 11, 12] },
  { wave: 7, modules: [4, 8, 12, 13], days: [1, 2, 3, 4, 5, 6] },
  { wave: 8, modules: [4, 8, 12, 13], days: [7, 8, 9, 10, 11, 12] },
];

export function HomeScreen() {
  const router = useRouter();
  const { isDark } = useThemeToggle();
  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
  const gate = useLearningJourneyGate();
  const { data: resumeStatus, isLoading: isResumeStatusLoading } = useGetResumeStatusQuery();
  const tier = usePlanTier();
  const insets = useSafeAreaInsets();

  const { data: modulesData, isLoading: isModulesLoading } = useGetModulesQuery(undefined, {
    skip: !gate.canEnter,
  });

  const personalizedPath = useMemo(() => {
    if (!modulesData) return null;
    return {
      modules: modulesData.map((m) => ({
        id: m.id,
        module_no: m.order_index,
        title: m.title,
        variant_id: null,
        is_unlocked: true,
      })),
    };
  }, [modulesData]);

  const [triggerGetModuleDays] = useLazyGetModuleDaysQuery();
  const [moduleDaysData, setModuleDaysData] = React.useState<Record<string, ModuleDay[]>>({});

  React.useEffect(() => {
    if (!personalizedPath?.modules?.length) return;

    const fetchAllDays = async () => {
      try {
        const promises = personalizedPath.modules.map(async (m) => {
          try {
            const data = await triggerGetModuleDays(m.id).unwrap();
            return { moduleId: m.id, days: data };
          } catch (e) {
            console.warn(`Failed to fetch days for module ${m.module_no}:`, e);
            return { moduleId: m.id, days: [] };
          }
        });
        const results = await Promise.all(promises);

        const newData: Record<string, ModuleDay[]> = {};
        for (const res of results) {
          newData[res.moduleId] = res.days;
        }
        setModuleDaysData(newData);
      } catch (err) {
        console.error("Error fetching all days:", err);
      }
    };

    fetchAllDays();
  }, [personalizedPath, triggerGetModuleDays]);

  const allDaysList = useMemo<CombinedModuleDay[]>(() => {
    if (!personalizedPath?.modules?.length) return [];

    const daysByModuleNo: Record<number, ModuleDay[]> = {};
    const moduleByNo: Record<number, (typeof personalizedPath.modules)[0]> = {};

    for (const m of personalizedPath.modules) {
      daysByModuleNo[m.module_no] = moduleDaysData[m.id] || [];
      moduleByNo[m.module_no] = m;
    }

    const combined: CombinedModuleDay[] = [];
    for (const waveConfig of PROGRESSION_WAVES) {
      for (const mNo of waveConfig.modules) {
        const moduleItem = moduleByNo[mNo];
        if (!moduleItem) continue;

        const moduleDays = daysByModuleNo[mNo] || [];
        for (const dNum of waveConfig.days) {
          const dayObj = moduleDays.find((d) => d.day_number === dNum);
          if (dayObj) {
            combined.push({
              ...dayObj,
              module_no: moduleItem.module_no,
              module_title: moduleItem.title,
              module_id: moduleItem.id,
            });
          }
        }
      }
    }
    return combined;
  }, [personalizedPath, moduleDaysData]);

  const firstIncompleteIdx = useMemo(() => {
    return allDaysList.findIndex((d) => !d.is_completed);
  }, [allDaysList]);

  const activeDay = useMemo(() => {
    if (allDaysList.length === 0) return null;
    return firstIncompleteIdx !== -1
      ? allDaysList[firstIncompleteIdx]
      : allDaysList[allDaysList.length - 1];
  }, [allDaysList, firstIncompleteIdx]);

  const activeModule = useMemo(() => {
    if (!activeDay) return null;
    return {
      module_id: activeDay.module_id,
      title: activeDay.module_title,
    };
  }, [activeDay]);

  const daysCompleted = useMemo(() => {
    return allDaysList.filter((d) => d.is_completed).length;
  }, [allDaysList]);

  const totalDays = useMemo(() => {
    return 156; // The course contains exactly 156 activities/days
  }, []);

  const { data: dayProgress } = useGetDayProgressQuery(activeDay?.id ?? "", {
    skip: !activeDay,
  });

  const firstName = profile?.name?.split(" ")[0] || "there";

  // The dashboard's numbers come from two sources: profile (streaks/badges/xp) and the
  // per-module day data (days completed). Treat the card as loading until both are in, so it
  // renders a skeleton rather than zeros that snap to real values a beat later. Derive the
  // day-loading state from what has actually resolved rather than a manual flag: a flag set
  // in an effect gets stuck on skeleton forever when there are no modules or the modules
  // query fails (the effect returns early without clearing it).
  const isDaysLoading =
    gate.canEnter &&
    (isModulesLoading ||
      ((modulesData?.length ?? 0) > 0 && Object.keys(moduleDaysData).length === 0));
  const isDashboardLoading = isProfileLoading || isDaysLoading;

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
        params: {
          module_id: activeModule.module_id,
          day_number: String(
            firstIncompleteIdx !== -1 ? firstIncompleteIdx + 1 : allDaysList.length,
          ),
        },
      });
    } else {
      router.push("/(tabs)/my-learning" as never);
    }
  };

  const handleResumeFeaturePress = (route: string) => {
    if (isResumeStatusLoading) {
      return;
    }

    if (resumeStatus?.uploaded) {
      router.push(route as never);
    } else {
      if (Platform.OS === "web") {
        const wantsToUpload = window.confirm(
          "Your resume is not uploaded. To enable this feature, please upload your resume. Click OK to upload.",
        );
        if (wantsToUpload) {
          router.push("/onboarding-resume" as never);
        }
      } else {
        showAlert(
          "Resume Required",
          "Your resume is not uploaded. To enable this feature, please upload your resume.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Upload", onPress: () => router.push("/onboarding-resume" as never) },
          ],
        );
      }
    }
  };

  const continueTitle = useMemo(() => {
    if (!activeDay || !activeModule) return "Continue Learning";
    return `${activeModule.title} (Day ${firstIncompleteIdx !== -1 ? firstIncompleteIdx + 1 : allDaysList.length})`;
  }, [activeDay, activeModule, firstIncompleteIdx, allDaysList.length]);

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
        colors={isDark ? ["#0e0e11", "#121217", "#0e0e11"] : ["#faf5ff", "#f5f3ff", "#fafafd"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View style={{ flex: 1, paddingTop: insets.top }} className="flex-1">
        {/* Top Header greeting with avatar - FIXED AT TOP */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          }}
          className="flex-row items-center justify-between"
        >
          <View>
            <Text className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              <Text className="text-[#4f46e5] dark:text-[#3b82f6]">Hi, </Text>
              <Text className="text-[#94a3b8] dark:text-[#bef264]">
                {(firstName?.toUpperCase() || "").slice(0, 2)}
              </Text>
              <Text className="text-[#84cc16] dark:text-[#bef264]">
                {(firstName?.toUpperCase() || "").slice(2)}!
              </Text>
            </Text>
            <Text className="text-slate-400 dark:text-slate-500 text-sm mt-1 font-semibold">
              Ready to learn something new?
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <Pressable
              onPress={() => router.push("/profile" as never)}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#16161c] border border-indigo-100 dark:border-slate-800 items-center justify-center shadow-sm shadow-indigo-100 dark:shadow-none active:scale-95"
            >
              <View className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-900 items-center justify-center overflow-hidden">
                <Image
                  source={{
                    uri: getAvatarUri(profile?.avatar_id, profile?.id),
                  }}
                  className="w-full h-full"
                />
              </View>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            isLoading={isDashboardLoading}
            onTrack={() => router.push("/(tabs)/my-learning" as never)}
          />

          <View className="flex-row justify-between items-center mb-3 mt-1">
            <Text className="text-slate-900 dark:text-white font-bold text-base">
              Continue Learning
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/my-learning" as never)}>
              <Text className="text-indigo-600 dark:text-slate-400 text-sm font-semibold">
                View All
              </Text>
            </Pressable>
          </View>

          <ContinueLearningCard
            title={continueTitle}
            subtitle={continueSubtitle}
            onPress={handleContinuePress}
          />

          <FeatureGroupCard
            title="Convo Coach"
            subtitle="Practice with realistic mock interviews & scenarios"
            icon="✨"
            items={[
              {
                title: "Interview Playground",
                subtitle:
                  tier === "free"
                    ? "Upgrade to Pro to unlock"
                    : "Try, learn and improve — No pressure",
                locked: tier === "free",
                onPress: () => router.push("/interview-playground" as never),
              },
              {
                title: "Interview Buddy",
                subtitle:
                  tier === "free"
                    ? "Upgrade to Pro to unlock"
                    : "Practice with a buddy before it counts",
                locked: tier === "free",
                onPress: () => router.push("/ai-interview" as never),
              },
            ]}
          />

          <FeatureGroupCard
            title="Resume Builder"
            subtitle="Build a resume you're proud to share"
            icon="📝"
            items={[
              {
                title: "Resume Buddy",
                subtitle: "Know what recruiters notice",
                onPress: () => handleResumeFeaturePress("/resume-buddy"),
              },
              {
                title: "Craft your Resume",
                subtitle: "Design your story, your way",
                onPress: () => handleResumeFeaturePress("/resume"),
              },
            ]}
          />
        </ScrollView>
        <ChatFab onPress={() => router.push("/chat" as never)} />
      </View>
    </View>
  );
}
