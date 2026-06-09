import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { getAvatarUri } from "@/utils/avatar";
import type { ModuleDay } from "@powerup/shared";

export interface CombinedModuleDay extends ModuleDay {
  module_no: number;
  module_title: string;
  module_id: string;
}

import {
  useLazyGetModuleDaysQuery,
  useGetModulesQuery,
  useGetProgressionQuery,
} from "@/services/module-api";
import {
  useStartSessionMutation,
  useGetUserAssessmentResultQuery,
} from "@/services/assessment-api";
import {
  getPreAssessmentResults,
  savePreAssessmentResults,
  getCompletedSections,
  StoredPreAssessmentResult,
} from "@/services/auth-storage";
import { useGetProfileQuery } from "@/services/auth-api";
import { useLearningJourneyGate } from "@/hooks/useLearningJourneyGate";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { OfflineGameView } from "@/components/OfflineGameView";

interface PreAssessmentModalProps {
  visible: boolean;
  onClose: () => void;
  cefrRange?: string | null;
  results?: any | null;
}

// CEFR Score Mapping Constants
const DEFAULT_CEFR_PERCENTAGE = 83.33;
const MAX_CEFR_SCALE = 6;
const DEFAULT_WRITING_PERCENTAGE = 66.67;
const DEFAULT_SPEAKING_PERCENTAGE = 100.0;
const SCORE_SCALE_CONVERSION = 100;
const SCORE_AVERAGING_DIVISOR = 2;

function PreAssessmentModal({ visible, onClose, cefrRange, results }: PreAssessmentModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const actualCefr = results?.cefr_level ?? results?.cefr_range ?? cefrRange ?? null;

  // Only show real data — do NOT generate mock/derived scores if assessment is not completed.
  // The assessment is considered completed only when cefr_range is set on the profile.
  const isAssessmentComplete = !!actualCefr;

  // Only derive scores from real results if they exist AND assessment is complete.
  const hasRealResults =
    !!results && results.section_percentages && Object.keys(results.section_percentages).length > 0;

  const derivedResults = hasRealResults ? results : null;

  if (!visible) return null;

  // If assessment not yet completed — show a friendly "not completed" state
  if (!isAssessmentComplete) {
    return (
      <Animated.View style={[scoreStyles.modalOverlay, { opacity: opacityAnim }]}>
        <Animated.View style={[scoreStyles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
          <Pressable onPress={handleClose} style={scoreStyles.closeButton} hitSlop={8}>
            <Feather name="x" size={20} color="#64748b" />
          </Pressable>
          <Text style={scoreStyles.overallScoreTitle}>Pre-Assessment</Text>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Not yet completed
            </Text>
            <Text
              style={{ fontSize: 13, color: "#64748b", textAlign: "center", paddingHorizontal: 16 }}
            >
              Complete your diagnostic assessment to see your CEFR level and detailed scores here.
            </Text>
          </View>
          <Pressable onPress={handleClose} style={scoreStyles.doneButton}>
            <Text style={scoreStyles.doneButtonText}>Close</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  }

  // If assessment is completed but real results are not loaded yet — show a loading spinner
  if (isAssessmentComplete && !hasRealResults) {
    return (
      <Animated.View style={[scoreStyles.modalOverlay, { opacity: opacityAnim }]}>
        <Animated.View style={[scoreStyles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
          <Pressable onPress={handleClose} style={scoreStyles.closeButton} hitSlop={8}>
            <Feather name="x" size={20} color="#64748b" />
          </Pressable>
          <Text style={scoreStyles.overallScoreTitle}>Pre-Assessment</Text>
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#0f172a",
                marginTop: 16,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Retrieving Results...
            </Text>
            <Text
              style={{ fontSize: 13, color: "#64748b", textAlign: "center", paddingHorizontal: 24 }}
            >
              Connecting to the server to fetch your real score breakdown. Please wait a moment.
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  // derivedResults is guaranteed non-null here because isAssessmentComplete is true
  // (we early-returned above when !isAssessmentComplete where derivedResults === null)
  const safeResults = derivedResults;
  const percentage = safeResults?.percentage ?? 0;
  const obtainedPoints = Math.round(safeResults?.total_score ?? 0);
  const totalPoints = Math.round(safeResults?.max_score ?? 0);
  const formattedOverall = `${((percentage / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;
  const formattedPoints = `${obtainedPoints} of ${totalPoints}`;

  // Reading Score: A_READING percentage mapped out of MAX_CEFR_SCALE
  const readingPct = safeResults?.section_percentages?.["A_READING"] ?? DEFAULT_CEFR_PERCENTAGE;
  const readingScoreText = `${((readingPct / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;

  // Listening Score: average of A_LISTEN and D_LISTEN_ANSWER percentages mapped out of MAX_CEFR_SCALE
  const listen1 = safeResults?.section_percentages?.["A_LISTEN"] ?? DEFAULT_CEFR_PERCENTAGE;
  const listen2 = safeResults?.section_percentages?.["D_LISTEN_ANSWER"] ?? DEFAULT_CEFR_PERCENTAGE;
  const listenPct = (listen1 + listen2) / SCORE_AVERAGING_DIVISOR;
  const listeningScoreText = `${((listenPct / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;

  // Writing Score: C_GRAMMAR percentage mapped out of MAX_CEFR_SCALE
  const writingPct = safeResults?.section_percentages?.["C_GRAMMAR"] ?? DEFAULT_WRITING_PERCENTAGE;
  const writingScoreText = `${((writingPct / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;

  // Speaking Score: average of A_SPEAKING and B_SPEAKING percentages mapped out of MAX_CEFR_SCALE
  const speak1 = safeResults?.section_percentages?.["A_SPEAKING"] ?? DEFAULT_SPEAKING_PERCENTAGE;
  const speak2 = safeResults?.section_percentages?.["B_SPEAKING"] ?? DEFAULT_SPEAKING_PERCENTAGE;
  const speakPct = (speak1 + speak2) / SCORE_AVERAGING_DIVISOR;
  const speakingScoreText = `${((speakPct / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;

  return (
    <Animated.View style={[scoreStyles.modalOverlay, { opacity: opacityAnim }]}>
      <Animated.View style={[scoreStyles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
        {/* Close Button top-right */}
        <Pressable onPress={handleClose} style={scoreStyles.closeButton} hitSlop={8}>
          <Feather name="x" size={20} color="#64748b" />
        </Pressable>

        <Text style={scoreStyles.overallScoreTitle}>Overall Score</Text>

        {/* 1. Curved Gauge */}
        <View style={scoreStyles.gaugeWrapper}>
          {/* Background curved track */}
          <View style={scoreStyles.gaugeTrack} />
          {/* Active lavender path */}
          <View style={scoreStyles.gaugeFill} />
          {/* Central score content labels */}
          <View style={scoreStyles.gaugeCutout}>
            <Text style={scoreStyles.gaugeScoreText}>{formattedOverall}</Text>
            <Text style={scoreStyles.gaugePointsText}>{formattedPoints}</Text>
          </View>
        </View>

        <Text style={scoreStyles.cefrTitle}>CEFR: {actualCefr}</Text>

        {/* 2. Grid breakdown (2x2) */}
        <View style={scoreStyles.gridContainer}>
          {/* Row 1 */}
          <View style={scoreStyles.gridRow}>
            {/* Reading card */}
            <View style={scoreStyles.skillColumn}>
              <View style={scoreStyles.skillHeader}>
                <Feather name="book-open" size={15} color="#475569" style={{ marginRight: 6 }} />
                <Text style={scoreStyles.skillLabel}>Reading</Text>
              </View>
              <View style={scoreStyles.skillCard}>
                <Text style={scoreStyles.skillScoreText}>{readingScoreText}</Text>
              </View>
            </View>

            {/* Listening card */}
            <View style={scoreStyles.skillColumn}>
              <View style={scoreStyles.skillHeader}>
                <Feather name="headphones" size={15} color="#475569" style={{ marginRight: 6 }} />
                <Text style={scoreStyles.skillLabel}>Listening</Text>
              </View>
              <View style={scoreStyles.skillCard}>
                <Text style={scoreStyles.skillScoreText}>{listeningScoreText}</Text>
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View style={scoreStyles.gridRow}>
            {/* Writing card */}
            <View style={scoreStyles.skillColumn}>
              <View style={scoreStyles.skillHeader}>
                <Feather name="edit-2" size={15} color="#475569" style={{ marginRight: 6 }} />
                <Text style={scoreStyles.skillLabel}>Writing</Text>
              </View>
              <View style={scoreStyles.skillCard}>
                <Text style={scoreStyles.skillScoreText}>{writingScoreText}</Text>
              </View>
            </View>

            {/* Speaking card */}
            <View style={scoreStyles.skillColumn}>
              <View style={scoreStyles.skillHeader}>
                <Feather name="mic" size={15} color="#475569" style={{ marginRight: 6 }} />
                <Text style={scoreStyles.skillLabel}>Speaking</Text>
              </View>
              <View style={scoreStyles.skillCard}>
                <Text style={scoreStyles.skillScoreText}>{speakingScoreText}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Done primary button */}
        <Pressable onPress={handleClose} style={scoreStyles.doneButton}>
          <Text style={scoreStyles.doneButtonText}>Done</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function GateEmptyState({
  reason,
  onPrimary,
  isLoading = false,
  completedSections = [],
}: {
  reason: "onboarding" | "assessment";
  onPrimary: () => void;
  isLoading?: boolean;
  completedSections?: string[];
}) {
  const isOnboarding = reason === "onboarding";
  const completedCount = completedSections.length;
  const totalSections = 6;
  const progressPct = Math.round((completedCount / totalSections) * 100);

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-16 h-16 rounded-3xl bg-indigo-100 items-center justify-center mb-4">
        <Text className="text-3xl">{isOnboarding ? "📝" : "🎯"}</Text>
      </View>
      <Text className="text-slate-900 text-xl font-extrabold mb-2 text-center">
        {isOnboarding
          ? "Complete your onboarding"
          : completedCount > 0
            ? "Resume your Diagnostic Assessment"
            : "Take your Diagnostic Assessment"}
      </Text>
      <Text className="text-slate-500 text-center mb-6">
        {isOnboarding
          ? "Answer a few questions so we can build a learning path that fits you."
          : "We need to assess your skills before we can unlock your daily lessons."}
      </Text>

      {!isOnboarding && completedCount > 0 && (
        <View className="w-full max-w-sm bg-white border border-slate-200/80 rounded-2xl p-4 mb-8 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
              Assessment Progress
            </Text>
            <Text className="text-indigo-600 font-black text-xs">
              {completedCount} of {totalSections} completed
            </Text>
          </View>
          <View className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
            <View
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </View>
          <Text className="text-slate-400 font-bold text-[10px] text-right">
            {progressPct}% Completed
          </Text>
        </View>
      )}

      <Pressable
        onPress={onPrimary}
        disabled={isLoading}
        className={`px-8 py-4 rounded-2xl active:scale-95 ${isLoading ? "bg-slate-400" : "bg-slate-900"}`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-base">
            {isOnboarding
              ? "Start onboarding"
              : completedCount > 0
                ? "Resume assessment"
                : "Start assessment"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

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

export function LearningJourneyScreen() {
  const router = useRouter();
  const gate = useLearningJourneyGate();
  const insets = useSafeAreaInsets();

  const {
    data: profile,
    isFetching: profileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  const [showPreAssessmentModal, setShowPreAssessmentModal] = useState(false);
  const [preAssessmentResults, setPreAssessmentResults] =
    useState<StoredPreAssessmentResult | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  useEffect(() => {
    refetchProfile();
  }, []);

  useEffect(() => {
    getPreAssessmentResults().then((res) => {
      if (res) {
        setPreAssessmentResults(res);
      }
    });

    getCompletedSections().then((sections) => {
      if (sections) setCompletedSections(sections);
    });
  }, [showPreAssessmentModal, profile]);

  const {
    data: liveResult,
    error: liveResultError,
    isFetching: liveResultFetching,
  } = useGetUserAssessmentResultQuery({ user_id: profile?.id || "" }, { skip: !profile?.id });

  useEffect(() => {
    console.log("[DEBUG results] user_id:", profile?.id);
    console.log("[DEBUG results] gate.canEnter:", gate.canEnter);
    console.log("[DEBUG results] liveResult:", liveResult);
    console.log("[DEBUG results] liveResultError:", liveResultError);
    console.log("[DEBUG results] liveResultFetching:", liveResultFetching);
  }, [profile?.id, gate.canEnter, liveResult, liveResultError, liveResultFetching]);

  useEffect(() => {
    if (liveResult && "percentage" in liveResult) {
      savePreAssessmentResults(liveResult).catch((err: unknown) => {
        console.warn("Failed to sync live result to local storage:", err);
      });
      // Also update preAssessmentResults state so we don't wait for a reload
      setPreAssessmentResults(liveResult);
    }
  }, [liveResult]);

  const resultsToPass = liveResult || preAssessmentResults;

  const [isStartingSession, setIsStartingSession] = useState(false);
  const [startSession] = useStartSessionMutation();

  const {
    data: modulesData,
    isError: pathError,
    isFetching: pathFetching,
    refetch: refetchPath,
  } = useGetModulesQuery(undefined, {
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

  const {
    data: progression,
    isError: progressionError,
    isFetching: progressionFetching,
    refetch: refetchProgression,
  } = useGetProgressionQuery(undefined, {
    skip: !gate.canEnter,
  });

  const handleRetry = () => {
    refetchProfile();
    if (gate.canEnter) {
      refetchPath();
      refetchProgression();
      fetchAllDays(true);
    }
  };

  const [triggerGetModuleDays] = useLazyGetModuleDaysQuery();
  const [moduleDaysData, setModuleDaysData] = useState<Record<string, ModuleDay[]>>({});
  const [loadingAllDays, setLoadingAllDays] = useState(false);

  const fetchAllDays = useCallback(
    async (force = false) => {
      if (!personalizedPath?.modules?.length) return;
      setLoadingAllDays(true);
      try {
        const promises = personalizedPath.modules.map(async (m) => {
          try {
            const data = await triggerGetModuleDays(m.id, !force).unwrap();
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
      } finally {
        setLoadingAllDays(false);
      }
    },
    [personalizedPath, triggerGetModuleDays],
  );

  useEffect(() => {
    if (gate.canEnter) {
      fetchAllDays(false);
    }
  }, [fetchAllDays, gate.canEnter]);

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

  const firstIncompleteIndex = useMemo(() => {
    return allDaysList.findIndex((d) => !d.is_completed);
  }, [allDaysList]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (gate.canEnter) {
        await Promise.all([refetchPath(), refetchProgression(), fetchAllDays(true)]);
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetchPath, refetchProgression, fetchAllDays, gate.canEnter]);

  const handleStartOrResumeAssessment = async () => {
    setIsStartingSession(true);
    try {
      const session = await startSession().unwrap();
      router.push({
        pathname: "/assessment-entry" as any,
        params: { session_id: session.session_id },
      });
    } catch (err: any) {
      console.error("Start/resume assessment session failed:", err);
      Alert.alert("Error", "Could not start assessment. Please try again.");
    } finally {
      setIsStartingSession(false);
    }
  };

  const isError =
    (profileError || (gate.canEnter && (pathError || progressionError))) &&
    !profileFetching &&
    !pathFetching &&
    !progressionFetching;

  if (isError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          paddingTop: insets.top,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
          showsVerticalScrollIndicator={false}
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
            <Text className="text-slate-500 text-sm text-center leading-5 mb-4 px-2">
              We couldn't connect to the learning server. Please ensure the backend service is
              running and try again.
            </Text>

            {/* Inline Arcade Offline Game (Chrome Dino Style) */}
            <OfflineGameView />

            <View className="w-full gap-3 mt-4">
              <Pressable
                onPress={handleRetry}
                className="w-full bg-slate-900 active:bg-slate-800 py-4 rounded-xl items-center justify-center shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Try Again</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const isPathLoading =
    gate.canEnter &&
    (pathFetching ||
      progressionFetching ||
      loadingAllDays ||
      !personalizedPath ||
      !progression ||
      !allDaysList.length);

  if (!gate.ready || isPathLoading) {
    return <GamifiedMascotLoader title="Consulting AI Mentor..." />;
  }

  if (!gate.canEnter && gate.blockedReason === "onboarding") {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }} className="bg-slate-50">
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <View className="px-6 pt-12">
            <Text className="text-slate-500 text-sm">
              Hi{profile?.name ? `, ${profile?.name?.split(" ")[0] || ""}` : ""}!
            </Text>
            <Text className="text-slate-900 text-2xl font-extrabold">My Learning</Text>
          </View>
          <GateEmptyState
            reason="onboarding"
            completedSections={completedSections}
            onPrimary={() => {
              router.push("/onboarding");
            }}
            isLoading={false}
          />
        </ScrollView>
      </View>
    );
  }

  const isPreAssessmentDone = !!profile?.cefr_range || gate.canEnter;

  // Diagnostic Assessment complete flag
  const isDiagnosticComplete = isPreAssessmentDone;

  // Calculate dynamic Diagnostic Assessment details
  const diagProgress = isDiagnosticComplete
    ? 100
    : Math.round((completedSections.length / 6) * 100);
  const diagLessonsCompleted = isDiagnosticComplete ? 6 : completedSections.length;
  const diagXp = isDiagnosticComplete ? 150 : completedSections.length * 25;

  // Topics for days 1 to 12
  const STATIC_DAY_TOPICS = [
    "First Impression",
    "Personal Background",
    "Educational Journey",
    "Interests & Hobbies",
    "Career Goals",
    "Workplace Goals",
    "Work Experience",
    "Skill Highlights",
    "Project Showcase",
    "Mock Interview I",
    "Mock Interview II",
    "Final Module Check",
  ];

  // Resolve day items for current phase
  const dayItems = [];
  let globalDayIdx = 1;
  for (const dayObj of allDaysList) {
    const idx = globalDayIdx - 1;
    const isLocked =
      !isDiagnosticComplete || (firstIncompleteIndex !== -1 && idx > firstIncompleteIndex);
    const isCompleted = isDiagnosticComplete && !!dayObj?.is_completed && !isLocked;
    const isInProgress =
      isDiagnosticComplete && firstIncompleteIndex !== -1 && idx === firstIncompleteIndex;

    const topic = dayObj?.topic || STATIC_DAY_TOPICS[dayObj.day_number - 1] || "Daily Activities";
    const hours = dayObj?.duration_hours ?? 0.25;
    const minutes = Math.max(1, Math.round(hours * 60));

    const title = `Day ${globalDayIdx}: ${topic}`;
    const subtitle = isLocked
      ? "Complete previous stages to unlock"
      : isCompleted
        ? `Done · ${minutes} min`
        : `Tap to start · ~${minutes} min`;

    dayItems.push({
      id: dayObj?.id || `static_day_${globalDayIdx}`,
      dayNumber: dayObj.day_number,
      globalDayNumber: globalDayIdx,
      title,
      subtitle,
      isCompleted,
      isInProgress,
      isLocked,
      xp: isCompleted ? 50 : 0,
      durationMinutes: minutes,
      dayObj,
    });
    globalDayIdx++;
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-slate-50">
      {/* Report Card Modal for Pre-Assessment */}
      <PreAssessmentModal
        visible={showPreAssessmentModal}
        onClose={() => setShowPreAssessmentModal(false)}
        cefrRange={profile?.cefr_range || (isPreAssessmentDone ? "A2" : null)}
        results={resultsToPass}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 96 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top Header greeting with avatar */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text style={{ fontSize: 26, fontWeight: "900", color: "#4f46e5" }}>
              Hi,{" "}
              <Text style={{ color: "#94a3b8" }}>
                {(profile?.name?.split(" ")[0]?.toUpperCase() || "TINA").slice(0, 2)}
              </Text>
              <Text style={{ color: "#84cc16" }}>
                {(profile?.name?.split(" ")[0]?.toUpperCase() || "TINA").slice(2)}!
              </Text>
            </Text>
            <Text style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
              Ready to learn something new?
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/profile" as never)}
            className="w-12 h-12 rounded-full bg-slate-200 border border-slate-100 items-center justify-center overflow-hidden active:opacity-80"
          >
            <Image
              source={{
                uri: getAvatarUri(profile?.avatar_id, profile?.id),
              }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </Pressable>
        </View>

        {/* Section title header */}
        <View style={{ marginBottom: 16, marginTop: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#0f172a" }}>My Learning</Text>
          <Text style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
            Track where you're headed
          </Text>
        </View>

        {/* Timeline wrapper card */}
        <View style={timelineStyles.stagesCard}>
          {/* Item 1: Free Content */}
          <Pressable
            onPress={() =>
              Alert.alert("Free Content", "This free module is completed! Continue down your path.")
            }
            style={({ pressed }) => [timelineStyles.stageRow, { opacity: pressed ? 0.8 : 1 }]}
          >
            {/* Connector line segment going down */}
            <View
              style={{
                position: "absolute",
                top: 36,
                left: 17,
                width: 3,
                bottom: -32,
                backgroundColor: "#3b82f6",
                zIndex: 1,
              }}
            />
            <View className="relative mr-4" style={{ zIndex: 3, alignItems: "center" }}>
              <View style={[timelineStyles.stageIconCircle, timelineStyles.stageCircleCompleted]}>
                <Feather name="check" size={16} color="white" />
              </View>
            </View>
            <View style={timelineStyles.stageContent}>
              <View style={timelineStyles.stageHeaderRow}>
                <Text className="flex-1 text-lg font-bold text-slate-800">Free Content</Text>
                <View style={[timelineStyles.statusBadge, timelineStyles.badgeCompleted]}>
                  <Text style={[timelineStyles.badgeText, { color: "#15803d" }]}>Completed</Text>
                </View>
              </View>
              <Text style={timelineStyles.stageSubtitle}>The Fundamentals of Communication</Text>

              <View style={timelineStyles.progressBarBg}>
                <LinearGradient
                  colors={["#3b82f6", "#22c55e", "#84cc16"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[timelineStyles.progressBarFill, { width: "100%" }]}
                />
              </View>

              <View style={timelineStyles.progressLabelRow}>
                <Text style={timelineStyles.progressLabelText}>8 lessons completed</Text>
                <Text style={timelineStyles.progressLabelPercent}>100%</Text>
              </View>
              <Text style={timelineStyles.xpText}>350 XP earned</Text>
            </View>
          </Pressable>

          {/* Item 2: Trial Content */}
          <Pressable
            onPress={() =>
              Alert.alert(
                "Trial Content",
                "This trial module is completed! Continue down your path.",
              )
            }
            style={({ pressed }) => [timelineStyles.stageRow, { opacity: pressed ? 0.8 : 1 }]}
          >
            {/* Connector line segment going down */}
            <View
              style={{
                position: "absolute",
                top: 36,
                left: 17,
                width: 3,
                bottom: -32,
                backgroundColor: "#3b82f6",
                zIndex: 1,
              }}
            />
            <View className="relative mr-4" style={{ zIndex: 3, alignItems: "center" }}>
              <View style={[timelineStyles.stageIconCircle, timelineStyles.stageCircleCompleted]}>
                <Feather name="check" size={16} color="white" />
              </View>
            </View>
            <View style={timelineStyles.stageContent}>
              <View style={timelineStyles.stageHeaderRow}>
                <Text className="flex-1 text-lg font-bold text-slate-800">Trial Content</Text>
                <View style={[timelineStyles.statusBadge, timelineStyles.badgeCompleted]}>
                  <Text style={[timelineStyles.badgeText, { color: "#15803d" }]}>Completed</Text>
                </View>
              </View>
              <Text style={timelineStyles.stageSubtitle}>Behaviour in Workplace</Text>

              <View style={timelineStyles.progressBarBg}>
                <LinearGradient
                  colors={["#3b82f6", "#22c55e", "#84cc16"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[timelineStyles.progressBarFill, { width: "100%" }]}
                />
              </View>

              <View style={timelineStyles.progressLabelRow}>
                <Text style={timelineStyles.progressLabelText}>7 lessons completed</Text>
                <Text style={timelineStyles.progressLabelPercent}>100%</Text>
              </View>
              <Text style={timelineStyles.xpText}>250 XP earned</Text>
            </View>
          </Pressable>

          {/* Item 3: Diagnostic Assessment */}
          <Pressable
            onPress={
              isDiagnosticComplete
                ? () => setShowPreAssessmentModal(true)
                : handleStartOrResumeAssessment
            }
            disabled={isStartingSession}
            style={({ pressed }) => [timelineStyles.stageRow, { opacity: pressed ? 0.8 : 1 }]}
          >
            {/* Connector line segment going down */}
            <View
              style={{
                position: "absolute",
                top: 36,
                left: 17,
                width: 3,
                bottom: -32,
                backgroundColor: "#3b82f6",
                zIndex: 1,
              }}
            />
            <View className="relative mr-4" style={{ zIndex: 3, alignItems: "center" }}>
              <View
                style={[
                  timelineStyles.stageIconCircle,
                  isDiagnosticComplete
                    ? timelineStyles.stageCircleCompleted
                    : timelineStyles.stageCircleInProgress,
                ]}
              >
                <Feather name="check" size={16} color="white" />
              </View>
            </View>
            <View style={timelineStyles.stageContent}>
              <View style={timelineStyles.stageHeaderRow}>
                <Text className="flex-1 text-lg font-bold text-slate-800">
                  Diagnostic Assessment
                </Text>
                <View
                  style={[
                    timelineStyles.statusBadge,
                    isDiagnosticComplete
                      ? timelineStyles.badgeCompleted
                      : timelineStyles.badgeInProgress,
                  ]}
                >
                  <Text
                    style={[
                      timelineStyles.badgeText,
                      { color: isDiagnosticComplete ? "#15803d" : "#a16207" },
                    ]}
                  >
                    {isDiagnosticComplete
                      ? `Level ${profile?.cefr_range || "Assessed"}`
                      : "In Progress"}
                  </Text>
                </View>
              </View>
              <Text style={timelineStyles.stageSubtitle}>Assessing your skills</Text>

              <View style={timelineStyles.progressBarBg}>
                <LinearGradient
                  colors={["#3b82f6", "#22c55e", "#84cc16"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    timelineStyles.progressBarFill,
                    { width: isDiagnosticComplete ? "100%" : `${diagProgress}%` },
                  ]}
                />
              </View>

              <View style={timelineStyles.progressLabelRow}>
                <Text style={timelineStyles.progressLabelText}>
                  {diagLessonsCompleted} of 6 sections completed
                </Text>
                <Text style={timelineStyles.progressLabelPercent}>{diagProgress}%</Text>
              </View>
              <Text style={timelineStyles.xpText}>
                {isStartingSession
                  ? "Launching..."
                  : isDiagnosticComplete
                    ? "150 XP earned"
                    : `${diagXp} XP earned`}
              </Text>

              {/* Continue learning CTA button inside active card */}
              {!isDiagnosticComplete && (
                <Pressable
                  onPress={handleStartOrResumeAssessment}
                  disabled={isStartingSession}
                  style={timelineStyles.continueButton}
                >
                  <Text style={timelineStyles.continueButtonText}>Continue learning</Text>
                </Pressable>
              )}
            </View>
          </Pressable>

          {/* Items 4-15: Days 1 to 12 */}
          {dayItems.map((item, idx) => {
            const isLast = idx === dayItems.length - 1;
            const lineBgColor = item.isCompleted || item.isInProgress ? "#3b82f6" : "#cbd5e1";

            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (item.isLocked) {
                    Alert.alert(
                      "Locked Day",
                      "Please complete your Diagnostic Assessment to unlock your personalized learning path!",
                    );
                  } else if (!item.dayObj?.id) {
                    Alert.alert(
                      "Error",
                      "Day content is not available yet. Please try refreshing.",
                    );
                  } else {
                    router.push({
                      pathname: `/learning-journey/module/${item.dayObj.id}` as never,
                      params: {
                        module_id: item.dayObj.module_id,
                        day_number: String(item.globalDayNumber),
                      },
                    });
                  }
                }}
                style={({ pressed }) => [
                  timelineStyles.stageRow,
                  {
                    opacity: pressed ? 0.8 : 1,
                    marginBottom: isLast ? 0 : 32,
                  },
                ]}
              >
                {/* Connector line segment going down */}
                {!isLast && (
                  <View
                    style={{
                      position: "absolute",
                      top: 36,
                      left: 17,
                      width: 3,
                      bottom: -32,
                      backgroundColor: lineBgColor,
                      zIndex: 1,
                    }}
                  />
                )}
                <View className="relative mr-4" style={{ zIndex: 3, alignItems: "center" }}>
                  <View
                    style={[
                      timelineStyles.stageIconCircle,
                      item.isCompleted
                        ? timelineStyles.stageCircleCompleted
                        : item.isInProgress
                          ? timelineStyles.stageCircleInProgress
                          : timelineStyles.stageCircleLocked,
                    ]}
                  >
                    <Feather
                      name={item.isCompleted ? "check" : item.isLocked ? "lock" : "play"}
                      size={16}
                      color={item.isCompleted || item.isInProgress ? "white" : "#b4b8da"}
                    />
                  </View>
                </View>
                <View style={timelineStyles.stageContent}>
                  <View style={timelineStyles.stageHeaderRow}>
                    <Text
                      className={`flex-1 text-lg font-bold ${
                        item.isLocked ? "text-slate-400" : "text-slate-800"
                      }`}
                    >
                      {item.title}
                    </Text>
                    {item.isLocked && (
                      <View style={[timelineStyles.statusBadge, timelineStyles.badgeLocked]}>
                        <Text style={[timelineStyles.badgeText, { color: "#6366f1" }]}>Locked</Text>
                      </View>
                    )}
                    {item.isCompleted && (
                      <View style={[timelineStyles.statusBadge, timelineStyles.badgeCompleted]}>
                        <Text style={[timelineStyles.badgeText, { color: "#15803d" }]}>
                          Completed
                        </Text>
                      </View>
                    )}
                    {item.isInProgress && (
                      <View style={[timelineStyles.statusBadge, timelineStyles.badgeInProgress]}>
                        <Text style={[timelineStyles.badgeText, { color: "#a16207" }]}>
                          In Progress
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[timelineStyles.stageSubtitle, item.isLocked && { color: "#cbd5e1" }]}
                  >
                    {item.subtitle}
                  </Text>

                  {!item.isLocked &&
                    (() => {
                      const totalAct = item.dayObj?.total_activities ?? 0;
                      const compAct = item.dayObj?.completed_activities ?? 0;
                      const pct = item.isCompleted ? 100 : (item.dayObj?.progress_percentage ?? 0);

                      const progressLabelText = item.isCompleted
                        ? "Completed"
                        : compAct > 0
                          ? `${compAct} of ${totalAct} activities completed`
                          : "Not started";

                      return (
                        <>
                          <View style={timelineStyles.progressBarBg}>
                            <LinearGradient
                              colors={["#3b82f6", "#22c55e", "#84cc16"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={[timelineStyles.progressBarFill, { width: `${pct}%` }]}
                            />
                          </View>
                          <View style={timelineStyles.progressLabelRow}>
                            <Text style={timelineStyles.progressLabelText}>
                              {progressLabelText}
                            </Text>
                            <Text style={timelineStyles.progressLabelPercent}>{pct}%</Text>
                          </View>
                          <Text style={timelineStyles.xpText}>
                            {item.isCompleted ? "50 XP earned" : "50 XP potential"}
                          </Text>
                        </>
                      );
                    })()}

                  {/* Continue learning CTA button inside active day card */}
                  {item.isInProgress && (
                    <Pressable
                      onPress={() => {
                        if (!item.dayObj?.id) {
                          Alert.alert(
                            "Error",
                            "Day content is not available yet. Please try refreshing.",
                          );
                        } else {
                          router.push({
                            pathname: `/learning-journey/module/${item.dayObj.id}` as never,
                            params: {
                              module_id: item.dayObj.module_id,
                              day_number: String(item.globalDayNumber),
                            },
                          });
                        }
                      }}
                      style={timelineStyles.continueButton}
                    >
                      <Text style={timelineStyles.continueButtonText}>Continue learning</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  stagesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    position: "relative",
  },
  timelineVerticalLine: {
    position: "absolute",
    left: Platform.OS === "android" ? 18 : 42,
    top: Platform.OS === "android" ? 18 : 42,
    bottom: Platform.OS === "android" ? 18 : 42,
    width: 3,
    backgroundColor: "#cbd5e1",
    zIndex: 1,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
    position: "relative",
    zIndex: 2,
  },
  stageIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  stageCircleCompleted: {
    backgroundColor: "#3b82f6",
  },
  stageCircleInProgress: {
    backgroundColor: "#3b82f6",
  },
  stageCircleLocked: {
    backgroundColor: "#e2e5f5",
  },
  stageContent: {
    flex: 1,
  },
  stageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeCompleted: {
    backgroundColor: "#dcfce7",
  },
  badgeInProgress: {
    backgroundColor: "#fef9c3",
  },
  badgeLocked: {
    backgroundColor: "#e0e7ff",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  stageSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 2,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    width: "100%",
  },
  progressLabelText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  progressLabelPercent: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
  },
  xpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  continueButton: {
    backgroundColor: "#3b82f6",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  lockedHintText: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
  },
});

const scoreStyles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20000,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 24,
    width: "88%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    zIndex: 20001,
  },
  overallScoreTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
  },
  gaugeWrapper: {
    width: 160,
    height: 90,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    marginBottom: 12,
  },
  gaugeTrack: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 14,
    borderColor: "#e2e8f0",
    position: "absolute",
    top: 0,
  },
  gaugeFill: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 14,
    borderColor: "transparent",
    borderTopColor: "#94a3b8",
    borderLeftColor: "#94a3b8",
    borderRightColor: "#94a3b8",
    position: "absolute",
    top: 0,
    transform: [{ rotate: "-15deg" }], // perfectly centers the 5.0 of 6 arch
  },
  gaugeCutout: {
    position: "absolute",
    top: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeScoreText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  gaugePointsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  cefrTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 28,
    textAlign: "center",
  },
  gridContainer: {
    width: "100%",
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  skillColumn: {
    width: "47%",
    alignItems: "center",
  },
  skillHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  skillCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  skillScoreText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e1b4b",
  },
  doneButton: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doneButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
});
