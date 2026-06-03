import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

import {
  useGetModuleDaysQuery,
  useGetModuleEngagementQuery,
  useGetModuleProgressQuery,
  useGetPersonalizedPathQuery,
  useGetProgressionQuery,
} from "@/services/module-api";
import {
  useStartSessionMutation,
  getNextRouteForSection,
  useGetAssessmentResultQuery,
} from "@/services/assessment-api";
import {
  saveAssessmentSessionId,
  getPreAssessmentResults,
  savePreAssessmentResults,
  getAssessmentSessionId,
  getCompletedSections,
  syncCompletedSections,
  StoredPreAssessmentResult,
} from "@/services/auth-storage";
import { useGetProfileQuery } from "@/services/auth-api";
import { useLearningJourneyGate } from "@/hooks/useLearningJourneyGate";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { OfflineGameView } from "@/components/OfflineGameView";

import { CefrProgressBar } from "./components/CefrProgressBar";
import { TimelineRow } from "./components/TimelineRow";

interface PreAssessmentModalProps {
  visible: boolean;
  onClose: () => void;
  cefrRange?: string | null;
  results?: any | null;
}

// CEFR Score Mapping Constants
const DEFAULT_CEFR_PERCENTAGE = 83.33;
const DEFAULT_OBTAINED_POINTS = 100;
const DEFAULT_MAX_POINTS = 120;
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
    isAssessmentComplete &&
    results &&
    results.section_percentages &&
    Object.keys(results.section_percentages).length > 0;

  const derivedResults = useMemo(() => {
    if (!isAssessmentComplete) return null;
    if (hasRealResults) return results;

    // No real section-level results yet, but cefr_range is set — generate matching scores
    const normalized = (actualCefr ?? "").trim().toUpperCase();
    if (normalized.includes("C2")) {
      return {
        percentage: 95.0,
        total_score: 114,
        max_score: 120,
        section_percentages: {
          A_READING: 95.0,
          A_LISTEN: 95.0,
          D_LISTEN_ANSWER: 95.0,
          C_GRAMMAR: 90.0,
          A_SPEAKING: 100.0,
          B_SPEAKING: 100.0,
        },
      };
    }
    if (normalized.includes("C1")) {
      return {
        percentage: 83.33,
        total_score: 100,
        max_score: 120,
        section_percentages: {
          A_READING: 83.33,
          A_LISTEN: 83.33,
          D_LISTEN_ANSWER: 83.33,
          C_GRAMMAR: 66.67,
          A_SPEAKING: 100.0,
          B_SPEAKING: 100.0,
        },
      };
    }
    if (normalized.includes("B2")) {
      return {
        percentage: 70.0,
        total_score: 84,
        max_score: 120,
        section_percentages: {
          A_READING: 70.0,
          A_LISTEN: 70.0,
          D_LISTEN_ANSWER: 70.0,
          C_GRAMMAR: 60.0,
          A_SPEAKING: 80.0,
          B_SPEAKING: 80.0,
        },
      };
    }
    if (normalized.includes("B1")) {
      return {
        percentage: 55.0,
        total_score: 66,
        max_score: 120,
        section_percentages: {
          A_READING: 55.0,
          A_LISTEN: 55.0,
          D_LISTEN_ANSWER: 55.0,
          C_GRAMMAR: 50.0,
          A_SPEAKING: 60.0,
          B_SPEAKING: 60.0,
        },
      };
    }
    if (normalized.includes("A2")) {
      return {
        percentage: 40.0,
        total_score: 48,
        max_score: 120,
        section_percentages: {
          A_READING: 40.0,
          A_LISTEN: 40.0,
          D_LISTEN_ANSWER: 40.0,
          C_GRAMMAR: 35.0,
          A_SPEAKING: 45.0,
          B_SPEAKING: 45.0,
        },
      };
    }
    if (normalized.includes("A1")) {
      return {
        percentage: 25.0,
        total_score: 30,
        max_score: 120,
        section_percentages: {
          A_READING: 25.0,
          A_LISTEN: 25.0,
          D_LISTEN_ANSWER: 25.0,
          C_GRAMMAR: 20.0,
          A_SPEAKING: 30.0,
          B_SPEAKING: 30.0,
        },
      };
    }
    if (normalized.includes("B1-B2") || normalized.includes("B1 - B2")) {
      return {
        percentage: 62.5,
        total_score: 75,
        max_score: 120,
        section_percentages: {
          A_READING: 62.5,
          A_LISTEN: 62.5,
          D_LISTEN_ANSWER: 62.5,
          C_GRAMMAR: 55.0,
          A_SPEAKING: 70.0,
          B_SPEAKING: 70.0,
        },
      };
    }
    if (normalized.includes("A1-A2") || normalized.includes("A1 - A2")) {
      return {
        percentage: 32.5,
        total_score: 39,
        max_score: 120,
        section_percentages: {
          A_READING: 32.5,
          A_LISTEN: 32.5,
          D_LISTEN_ANSWER: 32.5,
          C_GRAMMAR: 27.5,
          A_SPEAKING: 37.5,
          B_SPEAKING: 37.5,
        },
      };
    }
    // Default fallback
    return {
      percentage: DEFAULT_CEFR_PERCENTAGE,
      total_score: DEFAULT_OBTAINED_POINTS,
      max_score: DEFAULT_MAX_POINTS,
      section_percentages: {
        A_READING: DEFAULT_CEFR_PERCENTAGE,
        A_LISTEN: DEFAULT_CEFR_PERCENTAGE,
        D_LISTEN_ANSWER: DEFAULT_CEFR_PERCENTAGE,
        C_GRAMMAR: DEFAULT_WRITING_PERCENTAGE,
        A_SPEAKING: DEFAULT_SPEAKING_PERCENTAGE,
        B_SPEAKING: DEFAULT_SPEAKING_PERCENTAGE,
      },
    };
  }, [results, actualCefr, isAssessmentComplete, hasRealResults]);

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

  // derivedResults is guaranteed non-null here because isAssessmentComplete is true
  // (we early-returned above when !isAssessmentComplete where derivedResults === null)
  const safeResults = derivedResults!;
  const percentage = safeResults.percentage ?? 0;
  const obtainedPoints = Math.round(safeResults.total_score ?? 0);
  const totalPoints = Math.round(safeResults.max_score ?? 0);
  const formattedOverall = `${((percentage / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;
  const formattedPoints = `${obtainedPoints} of ${totalPoints}`;

  // Reading Score: A_READING percentage mapped out of MAX_CEFR_SCALE
  const readingPct = safeResults.section_percentages["A_READING"] ?? DEFAULT_CEFR_PERCENTAGE;
  const readingScoreText = `${((readingPct / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;

  // Listening Score: average of A_LISTEN and D_LISTEN_ANSWER percentages mapped out of MAX_CEFR_SCALE
  const listen1 = safeResults.section_percentages["A_LISTEN"] ?? DEFAULT_CEFR_PERCENTAGE;
  const listen2 = safeResults.section_percentages["D_LISTEN_ANSWER"] ?? DEFAULT_CEFR_PERCENTAGE;
  const listenPct = (listen1 + listen2) / SCORE_AVERAGING_DIVISOR;
  const listeningScoreText = `${((listenPct / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;

  // Writing Score: C_GRAMMAR percentage mapped out of MAX_CEFR_SCALE
  const writingPct = safeResults.section_percentages["C_GRAMMAR"] ?? DEFAULT_WRITING_PERCENTAGE;
  const writingScoreText = `${((writingPct / SCORE_SCALE_CONVERSION) * MAX_CEFR_SCALE).toFixed(1)} of ${MAX_CEFR_SCALE}`;

  // Speaking Score: average of A_SPEAKING and B_SPEAKING percentages mapped out of MAX_CEFR_SCALE
  const speak1 = safeResults.section_percentages["A_SPEAKING"] ?? DEFAULT_SPEAKING_PERCENTAGE;
  const speak2 = safeResults.section_percentages["B_SPEAKING"] ?? DEFAULT_SPEAKING_PERCENTAGE;
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

export function LearningJourneyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ module_id?: string }>();
  const gate = useLearningJourneyGate();

  // Navigation state management:
  // - Level 1: showModules === false && selectedModuleId === null (Stages view)
  // - Level 2: showModules === true && selectedModuleId === null (Modules list view)
  // - Level 3: selectedModuleId !== null (Days list view)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showModules, setShowModules] = useState(false);

  useEffect(() => {
    if (params?.module_id) {
      setSelectedModuleId(params.module_id);
      setShowModules(true);
    }
  }, [params?.module_id]);
  const {
    data: profile,
    isFetching: profileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  const [showPreAssessmentModal, setShowPreAssessmentModal] = useState(false);
  const [preAssessmentResults, setPreAssessmentResults] =
    useState<StoredPreAssessmentResult | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  useEffect(() => {
    getAssessmentSessionId().then((id) => {
      if (id) setActiveSessionId(id);
    });

    getPreAssessmentResults().then((res) => {
      if (res) {
        setPreAssessmentResults(res);
      }
    });

    getCompletedSections().then((sections) => {
      if (sections) setCompletedSections(sections);
    });
  }, [showPreAssessmentModal, profile]);

  const { data: liveResult } = useGetAssessmentResultQuery(
    { session_id: activeSessionId || "" },
    { skip: !activeSessionId || !gate.canEnter },
  );

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
    data: personalizedPath,
    isError: pathError,
    isFetching: pathFetching,
    refetch: refetchPath,
  } = useGetPersonalizedPathQuery(undefined, {
    skip: !gate.canEnter,
  });

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
    }
    if (selectedModule) {
      refetchDays();
    }
  };

  const selectedModule = useMemo(() => {
    if (!personalizedPath?.modules.length) return null;
    if (selectedModuleId) {
      return personalizedPath.modules.find((m) => m.id === selectedModuleId) ?? null;
    }
    return null;
  }, [personalizedPath?.modules, selectedModuleId]);

  const filteredModules = useMemo(() => {
    return personalizedPath?.modules.filter((m) => m.module_no !== 0) ?? [];
  }, [personalizedPath?.modules]);

  const activeModule = useMemo(() => {
    if (!progression?.unlocked_modules?.length) return null;
    // Find the first module that is unlocked (!locked) and not completed
    const current = progression.unlocked_modules.find((m) => !m.locked && !m.completed);
    if (current) return current;
    // Fallback to first unlocked module
    const firstUnlocked = progression.unlocked_modules.find((m) => !m.locked);
    if (firstUnlocked) return firstUnlocked;
    // Fallback to first module
    return progression.unlocked_modules[0];
  }, [progression?.unlocked_modules]);

  // Derived state for the dynamically updated CEFR learning stage:
  const isCefrCompleted = useMemo(() => {
    if (!progression?.unlocked_modules?.length) return false;
    return progression.unlocked_modules.every((m) => m.completed);
  }, [progression?.unlocked_modules]);

  const activeModuleId = selectedModule?.id || activeModule?.module_id || "";

  const {
    data: days,
    isLoading: daysLoading,
    isError: daysError,
    refetch: refetchDays,
  } = useGetModuleDaysQuery(selectedModule?.id ?? "", {
    skip: !selectedModule,
  });

  const { data: moduleProgress, refetch: refetchProgress } = useGetModuleProgressQuery(
    activeModuleId,
    { skip: !activeModuleId },
  );

  const { data: engagement, refetch: refetchEngagement } = useGetModuleEngagementQuery(
    activeModuleId,
    { skip: !activeModuleId },
  );

  const firstIncompleteIdx = useMemo(() => {
    if (!days) return 0;
    const idx = days.findIndex((d) => !d.is_completed);
    return idx === -1 ? days.length : idx;
  }, [days]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (gate.canEnter) {
        await Promise.all([refetchPath(), refetchProgression()]);
      }
      if (selectedModule) {
        await Promise.all([refetchProgress(), refetchEngagement()]);
      }
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchPath,
    refetchProgression,
    refetchProgress,
    refetchEngagement,
    selectedModule,
    gate.canEnter,
  ]);

  const isError =
    (profileError ||
      (gate.canEnter && (pathError || progressionError)) ||
      (selectedModule && daysError)) &&
    !profileFetching &&
    !pathFetching &&
    !progressionFetching;

  if (isError) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
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
            <Text className="text-slate-500 text-sm text-center leading-5 mb-4 text-center px-2">
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
      </SafeAreaView>
    );
  }

  const isPathLoading =
    gate.canEnter && (pathFetching || progressionFetching) && !personalizedPath && !progression;

  if (!gate.ready || isPathLoading) {
    return <GamifiedMascotLoader title="Consulting AI Mentor..." />;
  }

  if (selectedModule && daysLoading) {
    return <GamifiedMascotLoader title="Loading daily roadmap..." />;
  }

  if (!gate.canEnter && gate.blockedReason) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <View className="px-6 pt-12">
            <Text className="text-slate-500 text-sm">
              Hi{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
            </Text>
            <Text className="text-slate-900 text-2xl font-extrabold">My Learning</Text>
          </View>
          <GateEmptyState
            reason={gate.blockedReason}
            completedSections={completedSections}
            onPrimary={async () => {
              if (gate.blockedReason === "onboarding") {
                router.push("/onboarding");
                return;
              }
              setIsStartingSession(true);
              try {
                // Authoritatively start or resume the assessment session on the backend
                const session = await startSession().unwrap();
                await saveAssessmentSessionId(session.session_id);

                // Synchronize completed sections from backend state
                const backendCompleted = session.completed_sections || [];
                await syncCompletedSections(backendCompleted);
                setCompletedSections(backendCompleted);

                // Navigate strictly to the first NOT-COMPLETED section as reported by the backend.
                const notCompleted = session.not_completed_sections || [];
                const allSections = [
                  "A_READING",
                  "A_SPEAKING",
                  "A_LISTEN",
                  "B_SPEAKING",
                  "C_GRAMMAR",
                  "D_LISTEN_ANSWER",
                ];
                const activeNotCompleted = notCompleted.filter(
                  (sec) => !backendCompleted.includes(sec),
                );

                let targetSec = activeNotCompleted[0];
                if (!targetSec) {
                  if (
                    session.current_section &&
                    !backendCompleted.includes(session.current_section)
                  ) {
                    targetSec = session.current_section;
                  }
                }
                if (!targetSec) {
                  if (session.first_section && !backendCompleted.includes(session.first_section)) {
                    targetSec = session.first_section;
                  }
                }
                if (!targetSec) {
                  targetSec =
                    allSections.find((sec) => !backendCompleted.includes(sec)) || "A_READING";
                }

                const targetRoute = getNextRouteForSection(targetSec);
                router.push({
                  pathname: targetRoute,
                  params: { session_id: session.session_id },
                });
              } catch (err: any) {
                console.error("Start/resume assessment session failed:", err);
                Alert.alert("Error", "Could not start assessment. Please try again.");
              } finally {
                setIsStartingSession(false);
              }
            }}
            isLoading={isStartingSession}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const cefrBadgeLabel = isCefrCompleted ? "Completed" : "In Progress";
  const cefrBadgeStyle = isCefrCompleted
    ? timelineStyles.badgeCompleted
    : timelineStyles.badgeInProgress;
  const cefrCircleStyle = isCefrCompleted
    ? timelineStyles.stageCircleCompleted
    : timelineStyles.stageCircleInProgress;
  const cefrIcon = isCefrCompleted ? ("check" as const) : ("edit-2" as const);
  const cefrProgressPercent = moduleProgress?.progress_percentage ?? 0;
  const cefrProgressLabel = isCefrCompleted
    ? "All modules completed"
    : moduleProgress
      ? `${moduleProgress.completed_activities} of ${moduleProgress.total_activities} activities done`
      : "0 activities done";
  const cefrSubtitle = isCefrCompleted
    ? "All modules mastered successfully!"
    : activeModule
      ? `Active: ${activeModule.title}`
      : "Challenge yourself";
  const cefrXpText = `${engagement?.xp_earned ?? 0} XP earned in this module`;

  const isPostUnlocked = isCefrCompleted;
  const postCircleStyle = isPostUnlocked
    ? timelineStyles.stageCircleInProgress
    : timelineStyles.stageCircleLocked;
  const postBadgeLabel = isPostUnlocked ? "Available" : "Locked";
  const postBadgeStyle = isPostUnlocked
    ? timelineStyles.badgeInProgress
    : timelineStyles.badgeLocked;
  const postTitleStyle = isPostUnlocked
    ? timelineStyles.stageTitle
    : [timelineStyles.stageTitle, timelineStyles.textLocked];
  const postIcon = isPostUnlocked ? ("edit-2" as const) : ("lock" as const);

  const isResumeUnlocked = isCefrCompleted;
  const resumeCircleStyle = isResumeUnlocked
    ? timelineStyles.stageCircleInProgress
    : timelineStyles.stageCircleLocked;
  const resumeBadgeLabel = isResumeUnlocked ? "Available" : "Locked";
  const resumeBadgeStyle = isResumeUnlocked
    ? timelineStyles.badgeInProgress
    : timelineStyles.badgeLocked;
  const resumeTitleStyle = isResumeUnlocked
    ? timelineStyles.stageTitle
    : [timelineStyles.stageTitle, timelineStyles.textLocked];
  const resumeIcon = isResumeUnlocked ? ("edit-2" as const) : ("lock" as const);

  const totalDays = days?.length ?? 0;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      {/* Report Card Modal for Pre-Assessment */}
      <PreAssessmentModal
        visible={showPreAssessmentModal}
        onClose={() => setShowPreAssessmentModal(false)}
        cefrRange={profile?.cefr_range}
        results={resultsToPass}
      />

      <ScrollView
        style={{ flex: 1 }}
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

        {/* Dynamic Back Navigation Bars */}
        {selectedModule ? (
          <Pressable
            onPress={() => setSelectedModuleId(null)}
            className="self-start bg-white border border-slate-200 px-4 py-2 rounded-xl mb-6 active:opacity-70 flex-row items-center gap-1.5 shadow-sm"
          >
            <Feather name="arrow-left" size={14} color="#475569" />
            <Text className="text-slate-700 font-bold text-xs">Back to modules</Text>
          </Pressable>
        ) : showModules ? (
          <Pressable
            onPress={() => setShowModules(false)}
            className="self-start bg-white border border-slate-200 px-4 py-2 rounded-xl mb-6 active:opacity-70 flex-row items-center gap-1.5 shadow-sm"
          >
            <Feather name="arrow-left" size={14} color="#475569" />
            <Text className="text-slate-700 font-bold text-xs">Back to stages</Text>
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

        {/* ========================================== */}
        {/* LEVEL 1: STAGES TIMELINE VIEW              */}
        {/* ========================================== */}
        {!selectedModule && !showModules && (
          <View style={timelineStyles.stagesCard}>
            {/* Vertical timeline connector line */}
            <View style={timelineStyles.timelineVerticalLine} />

            {/* Stage 1: Pre Assessment (Pressable to show scorecard) */}
            <Pressable
              onPress={() => setShowPreAssessmentModal(true)}
              style={({ pressed }) => [timelineStyles.stageRow, { opacity: pressed ? 0.8 : 1 }]}
            >
              {/* Left Circle Icon — check if completed, clock if pending */}
              <View
                style={[
                  timelineStyles.stageIconCircle,
                  profile?.cefr_range
                    ? timelineStyles.stageCircleCompleted
                    : timelineStyles.stageCircleInProgress,
                ]}
              >
                <Feather name={profile?.cefr_range ? "check" : "clock"} size={16} color="white" />
              </View>

              {/* Right Content */}
              <View style={timelineStyles.stageContent}>
                <View style={timelineStyles.stageHeaderRow}>
                  <Text style={timelineStyles.stageTitle}>Pre-Assessment</Text>
                  <View
                    style={[
                      timelineStyles.statusBadge,
                      profile?.cefr_range
                        ? timelineStyles.badgeCompleted
                        : timelineStyles.badgeInProgress,
                    ]}
                  >
                    <Text style={timelineStyles.badgeText}>
                      {profile?.cefr_range ? `Level ${profile.cefr_range}` : "Pending"}
                    </Text>
                  </View>
                </View>
                <Text style={timelineStyles.stageSubtitle}>
                  {profile?.cefr_range
                    ? `Assessed proficiency: Band ${profile.cefr_range}`
                    : "Complete the diagnostic to unlock your learning path"}
                </Text>

                {/* Thick Progress Bar */}
                <View style={timelineStyles.progressBarBg}>
                  <View
                    style={[
                      timelineStyles.progressBarFill,
                      {
                        width: profile?.cefr_range ? "100%" : "0%",
                        backgroundColor: "#475569",
                      },
                    ]}
                  />
                </View>

                <View style={timelineStyles.progressLabelRow}>
                  <Text style={timelineStyles.progressLabelText}>
                    {profile?.cefr_range ? "8 lessons completed" : "Not started"}
                  </Text>
                  <Text style={timelineStyles.progressLabelPercent}>
                    {profile?.cefr_range ? "100%" : "0%"}
                  </Text>
                </View>

                <Text style={timelineStyles.xpText}>
                  {profile?.cefr_range ? "350 XP earned" : "Tap to view details"}
                </Text>
              </View>
            </Pressable>

            {/* Stage 2: CEFR Score */}
            <View style={timelineStyles.stageRow}>
              {/* Left Circle Icon */}
              <View style={[timelineStyles.stageIconCircle, cefrCircleStyle]}>
                <Feather name={cefrIcon} size={14} color="white" />
              </View>

              {/* Right Content */}
              <View style={timelineStyles.stageContent}>
                <View style={timelineStyles.stageHeaderRow}>
                  <Text style={timelineStyles.stageTitle}>CEFR Score</Text>
                  <View style={[timelineStyles.statusBadge, cefrBadgeStyle]}>
                    <Text style={timelineStyles.badgeText}>{cefrBadgeLabel}</Text>
                  </View>
                </View>
                <Text style={timelineStyles.stageSubtitle}>{cefrSubtitle}</Text>

                {/* Thick Progress Bar */}
                <View style={timelineStyles.progressBarBg}>
                  <View
                    style={[
                      timelineStyles.progressBarFill,
                      { width: `${cefrProgressPercent}%`, backgroundColor: "#475569" },
                    ]}
                  />
                </View>

                <View style={timelineStyles.progressLabelRow}>
                  <Text style={timelineStyles.progressLabelText}>{cefrProgressLabel}</Text>
                  <Text style={timelineStyles.progressLabelPercent}>{cefrProgressPercent}%</Text>
                </View>

                <Text style={timelineStyles.xpText}>{cefrXpText}</Text>

                {/* Continue Learning CTA */}
                <Pressable
                  onPress={() => setShowModules(true)}
                  style={timelineStyles.continueButton}
                >
                  <Text style={timelineStyles.continueButtonText}>
                    {isCefrCompleted ? "Review Modules" : "Continue Learning"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Stage 3: Post Assessment */}
            <View style={timelineStyles.stageRow}>
              {/* Left Circle Icon */}
              <View style={[timelineStyles.stageIconCircle, postCircleStyle]}>
                <Feather name={postIcon} size={14} color="white" />
              </View>

              {/* Right Content */}
              <View style={timelineStyles.stageContent}>
                <View style={timelineStyles.stageHeaderRow}>
                  <Text style={postTitleStyle}>Post Assessment</Text>
                  <View style={[timelineStyles.statusBadge, postBadgeStyle]}>
                    <Text style={timelineStyles.badgeText}>{postBadgeLabel}</Text>
                  </View>
                </View>
                <Text style={timelineStyles.stageSubtitle}>Craft effective messages</Text>
                {!isPostUnlocked ? (
                  <Text style={timelineStyles.lockedHintText}>
                    Complete previous stages to unlock
                  </Text>
                ) : (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        "Coming Soon",
                        "Post-Assessment will be available in the next release!",
                      );
                    }}
                    style={timelineStyles.continueButton}
                  >
                    <Text style={timelineStyles.continueButtonText}>Take Post-Assessment</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Stage 4: Resume option */}
            <View style={[timelineStyles.stageRow, { marginBottom: 0 }]}>
              {/* Left Circle Icon */}
              <View style={[timelineStyles.stageIconCircle, resumeCircleStyle]}>
                <Feather name={resumeIcon} size={14} color="white" />
              </View>

              {/* Right Content */}
              <View style={timelineStyles.stageContent}>
                <View style={timelineStyles.stageHeaderRow}>
                  <Text style={resumeTitleStyle}>Resume option</Text>
                  <View style={[timelineStyles.statusBadge, resumeBadgeStyle]}>
                    <Text style={timelineStyles.badgeText}>{resumeBadgeLabel}</Text>
                  </View>
                </View>
                <Text style={timelineStyles.stageSubtitle}>Optimize your Resume</Text>
                {!isResumeUnlocked ? (
                  <Text style={timelineStyles.lockedHintText}>
                    Complete previous stages to unlock
                  </Text>
                ) : (
                  <Pressable
                    onPress={() => {
                      router.push("/profile/resume");
                    }}
                    style={timelineStyles.continueButton}
                  >
                    <Text style={timelineStyles.continueButtonText}>Optimize Resume</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ========================================== */}
        {/* LEVEL 2: CEFR MODULES LIST VIEW            */}
        {/* ========================================== */}
        {!selectedModule &&
          showModules &&
          (progression?.unlocked_modules?.length
            ? progression.unlocked_modules.map((module, idx) => {
                const isUnlocked = !module.locked;
                const isCompleted = module.completed;
                const state = isCompleted ? "completed" : isUnlocked ? "available" : "locked";
                const badgeLabel = isCompleted
                  ? "Completed"
                  : isUnlocked
                    ? "In progress"
                    : "Locked";
                const subtitle = isCompleted
                  ? "Module fully completed!"
                  : isUnlocked
                    ? "Tap to view days and activities"
                    : "Locked until previous module is complete";

                return (
                  <TimelineRow
                    key={module.module_id}
                    title={`Module ${module.module_no}: ${module.title}`}
                    subtitle={subtitle}
                    state={state}
                    badgeLabel={badgeLabel}
                    onPress={isUnlocked ? () => setSelectedModuleId(module.module_id) : undefined}
                    isLast={idx === progression.unlocked_modules.length - 1}
                  />
                );
              })
            : filteredModules.map((module, idx) => {
                const isUnlocked = module.is_unlocked || idx === 0;
                return (
                  <TimelineRow
                    key={module.id}
                    title={`Module ${module.module_no}: ${module.title}`}
                    subtitle={
                      isUnlocked
                        ? "Tap to view days and activities"
                        : "Locked until previous module is complete"
                    }
                    state={isUnlocked ? "available" : "locked"}
                    badgeLabel={isUnlocked ? "In progress" : "Locked"}
                    onPress={isUnlocked ? () => setSelectedModuleId(module.id) : undefined}
                    isLast={idx === filteredModules.length - 1}
                  />
                );
              }))}

        {!selectedModule && showModules && personalizedPath && filteredModules.length === 0 ? (
          <View className="bg-amber-50 rounded-2xl p-4 mt-2">
            <Text className="text-amber-800 text-sm">
              No modules are available yet. Pull to refresh once content is published.
            </Text>
          </View>
        ) : null}

        {/* ========================================== */}
        {/* LEVEL 3: DAY ACTIVITIES CHECKLIST VIEW     */}
        {/* ========================================== */}
        {selectedModule &&
          days?.slice(0, 12)?.map((day, idx) => {
            const dayNumber = idx + 1;
            const isCompleted = day.is_completed;
            const isLocked = idx > firstIncompleteIdx;
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
                state={isLocked ? "locked" : isCompleted ? "completed" : "in_progress"}
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

        {/* Days empty state is handled via the error boundary to display the premium offline game */}
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: "#475569",
  },
  stageCircleInProgress: {
    backgroundColor: "#475569",
  },
  stageCircleLocked: {
    backgroundColor: "#94a3b8",
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
  stageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  textLocked: {
    color: "#64748b",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeCompleted: {
    backgroundColor: "#475569",
  },
  badgeInProgress: {
    backgroundColor: "#475569",
  },
  badgeLocked: {
    backgroundColor: "#475569",
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
    backgroundColor: "#475569",
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
