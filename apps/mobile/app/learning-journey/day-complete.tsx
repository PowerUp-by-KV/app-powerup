/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { useColorScheme } from "nativewind";
import LottieView from "lottie-react-native";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useGetDayResultsQuery,
  useAdvanceDayMutation,
  type ActivityResultDetail,
} from "@/services/module-api";
import { useGetProfileQuery } from "@/services/auth-api";
import { subscribeToEvaluationStatus } from "@/services/evaluation-sse-service";

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  activity: ActivityResultDetail | null;
}

function DetailedSpeakingModal({ visible, onClose, activity }: DetailModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!activity) return null;
  const breakdown = activity.score_breakdown || {};

  // Check if it's open speaking (presence of vocab, relevance or grammar)
  const isOpenSpeaking = "vocab" in breakdown || "relevance" in breakdown || "grammar" in breakdown;

  // CEFR levels (same as writing)
  const cefr = breakdown.cefr_level || (activity.passed ? "B1" : "A2");
  const targetCefr = breakdown.target_cefr_level || "B1";

  // Helper to scale/display open speaking scores
  const getScaleInfo = (val: number | undefined | null, maxStandard: number) => {
    const value = val ?? 0;
    const isMockVal = value > maxStandard;
    const maxVal = isMockVal ? 5.0 : maxStandard;
    const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
    return { pct, display: `${value}/${maxVal}` };
  };

  const relevance = getScaleInfo(breakdown.relevance, 3.0);
  const fluencyOpen = getScaleInfo(breakdown.fluency, 2.0);
  const vocab = getScaleInfo(breakdown.vocab, 1.5);
  const grammar = getScaleInfo(breakdown.grammar, 1.0);

  // Pronunciation metrics
  const accuracy = breakdown.accuracy ?? 0;
  const fluencyPron = breakdown.fluency ?? 0;
  const consistency = breakdown.consistency ?? 0;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContent, isDark && { backgroundColor: "#151620" }]}>
          <View style={[styles.modalHeader, isDark && { borderColor: "#242635" }]}>
            <Text style={[styles.modalTitle, isDark && { color: "#ffffff" }]}>
              Speaking Evaluation
            </Text>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, isDark && { backgroundColor: "#242635" }]}
            >
              <Feather name="x" size={20} color={isDark ? "#a1a1aa" : "#64748b"} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.scoreCircleContainer}>
              <View
                style={[
                  styles.scoreCircle,
                  {
                    borderColor: activity.passed
                      ? isDark
                        ? "#34d399"
                        : "#84cc16"
                      : isDark
                        ? "#f87171"
                        : "#64748b",
                  },
                ]}
              >
                <Text style={[styles.scoreText, isDark && { color: "#ffffff" }]}>
                  {activity.score ?? 0}
                </Text>
                <Text style={[styles.scoreLabel, isDark && { color: "#a1a1aa" }]}>Score</Text>
              </View>
              <Text
                style={[
                  styles.passBadge,
                  {
                    backgroundColor: activity.passed
                      ? isDark
                        ? "#064e3b"
                        : "#e2f9cc"
                      : isDark
                        ? "#7f1d1d"
                        : "#f1f5f9",
                    color: activity.passed
                      ? isDark
                        ? "#34d399"
                        : "#3f6212"
                      : isDark
                        ? "#f87171"
                        : "#475569",
                  },
                ]}
              >
                {activity.passed ? "Passed" : "Failed"}
              </Text>
            </View>

            <View
              style={[
                styles.sectionCard,
                isDark && { backgroundColor: "#1e1f2a", borderColor: "#2d2d3a" },
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && { color: "#cbd5e1" }]}>CEFR Levels</Text>
              <View style={styles.cefrContainer}>
                <View
                  style={[
                    styles.cefrBox,
                    isDark && { backgroundColor: "#151620", borderColor: "#242635" },
                  ]}
                >
                  <Text style={[styles.cefrLabel, isDark && { color: "#a1a1aa" }]}>
                    Target Band
                  </Text>
                  <Text style={[styles.cefrValue, isDark && { color: "#ffffff" }]}>
                    {targetCefr}
                  </Text>
                </View>
                <View
                  style={[
                    styles.cefrBox,
                    isDark && { backgroundColor: "#151620", borderColor: "#242635" },
                  ]}
                >
                  <Text style={[styles.cefrLabel, isDark && { color: "#a1a1aa" }]}>
                    Achieved Band
                  </Text>
                  <Text
                    style={[
                      styles.cefrValue,
                      {
                        color: activity.passed
                          ? isDark
                            ? "#34d399"
                            : "#84cc16"
                          : isDark
                            ? "#f87171"
                            : "#64748b",
                      },
                    ]}
                  >
                    {cefr}
                  </Text>
                </View>
              </View>
            </View>

            {breakdown.transcript ? (
              <View
                style={[
                  styles.sectionCard,
                  isDark && { backgroundColor: "#1e1f2a", borderColor: "#2d2d3a" },
                ]}
              >
                <Text style={[styles.sectionTitle, isDark && { color: "#cbd5e1" }]}>
                  Your Speech Transcript
                </Text>
                <Text style={[styles.transcriptText, isDark && { color: "#cbd5e1" }]}>
                  "{breakdown.transcript}"
                </Text>
              </View>
            ) : null}

            <View
              style={[
                styles.sectionCard,
                isDark && { backgroundColor: "#1e1f2a", borderColor: "#2d2d3a" },
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && { color: "#cbd5e1" }]}>
                Performance Breakdown
              </Text>
              {isOpenSpeaking ? (
                <>
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, isDark && { color: "#cbd5e1" }]}>
                      Relevance & Content
                    </Text>
                    <Text style={[styles.metricValue, isDark && { color: "#ffffff" }]}>
                      {relevance.display}
                    </Text>
                  </View>
                  <View style={[styles.metricBarBg, isDark && { backgroundColor: "#242635" }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${relevance.pct}%`, backgroundColor: "#3b82f6" },
                      ]}
                    />
                  </View>

                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, isDark && { color: "#cbd5e1" }]}>
                      Fluency & Coherence
                    </Text>
                    <Text style={[styles.metricValue, isDark && { color: "#ffffff" }]}>
                      {fluencyOpen.display}
                    </Text>
                  </View>
                  <View style={[styles.metricBarBg, isDark && { backgroundColor: "#242635" }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${fluencyOpen.pct}%`, backgroundColor: "#bef264" },
                      ]}
                    />
                  </View>

                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, isDark && { color: "#cbd5e1" }]}>
                      Vocabulary Range
                    </Text>
                    <Text style={[styles.metricValue, isDark && { color: "#ffffff" }]}>
                      {vocab.display}
                    </Text>
                  </View>
                  <View style={[styles.metricBarBg, isDark && { backgroundColor: "#242635" }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${vocab.pct}%`, backgroundColor: "#4f46e5" },
                      ]}
                    />
                  </View>

                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, isDark && { color: "#cbd5e1" }]}>
                      Grammar Accuracy
                    </Text>
                    <Text style={[styles.metricValue, isDark && { color: "#ffffff" }]}>
                      {grammar.display}
                    </Text>
                  </View>
                  <View style={[styles.metricBarBg, isDark && { backgroundColor: "#242635" }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${grammar.pct}%`, backgroundColor: "#93c5fd" },
                      ]}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, isDark && { color: "#cbd5e1" }]}>
                      Pronunciation Accuracy
                    </Text>
                    <Text style={[styles.metricValue, isDark && { color: "#ffffff" }]}>
                      {Math.round(accuracy)}%
                    </Text>
                  </View>
                  <View style={[styles.metricBarBg, isDark && { backgroundColor: "#242635" }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${accuracy}%`, backgroundColor: "#3b82f6" },
                      ]}
                    />
                  </View>

                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, isDark && { color: "#cbd5e1" }]}>
                      Speech Fluency
                    </Text>
                    <Text style={[styles.metricValue, isDark && { color: "#ffffff" }]}>
                      {Math.round(fluencyPron)}%
                    </Text>
                  </View>
                  <View style={[styles.metricBarBg, isDark && { backgroundColor: "#242635" }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${fluencyPron}%`, backgroundColor: "#bef264" },
                      ]}
                    />
                  </View>

                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, isDark && { color: "#cbd5e1" }]}>
                      Consistency
                    </Text>
                    <Text style={[styles.metricValue, isDark && { color: "#ffffff" }]}>
                      {Math.round(consistency)}%
                    </Text>
                  </View>
                  <View style={[styles.metricBarBg, isDark && { backgroundColor: "#242635" }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${consistency}%`, backgroundColor: "#4f46e5" },
                      ]}
                    />
                  </View>
                </>
              )}
            </View>

            {activity.feedback ? (
              <View
                style={[
                  styles.sectionCard,
                  isDark && { backgroundColor: "#1e1f2a", borderColor: "#2d2d3a" },
                ]}
              >
                <Text style={[styles.sectionTitle, isDark && { color: "#cbd5e1" }]}>
                  {isOpenSpeaking
                    ? "AI Speaking Mentor Feedback"
                    : "AI Pronunciation Coach Feedback"}
                </Text>
                <Text style={[styles.feedbackText, isDark && { color: "#cbd5e1" }]}>
                  {activity.feedback}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailedWritingModal({ visible, onClose, activity }: DetailModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!activity) return null;
  const breakdown = activity.score_breakdown || {};
  const cefr = breakdown.cefr_level || "N/A";
  const targetCefr = breakdown.target_cefr_level || "N/A";
  const errors = breakdown.grammar_errors || [];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContent, isDark && { backgroundColor: "#151620" }]}>
          <View style={[styles.modalHeader, isDark && { borderColor: "#242635" }]}>
            <Text style={[styles.modalTitle, isDark && { color: "#ffffff" }]}>
              Writing Evaluation
            </Text>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, isDark && { backgroundColor: "#242635" }]}
            >
              <Feather name="x" size={20} color={isDark ? "#a1a1aa" : "#64748b"} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.scoreCircleContainer}>
              <View
                style={[
                  styles.scoreCircle,
                  {
                    borderColor: activity.passed
                      ? isDark
                        ? "#34d399"
                        : "#84cc16"
                      : isDark
                        ? "#f87171"
                        : "#64748b",
                  },
                ]}
              >
                <Text style={[styles.scoreText, isDark && { color: "#ffffff" }]}>
                  {activity.score ?? 0}
                </Text>
                <Text style={[styles.scoreLabel, isDark && { color: "#a1a1aa" }]}>Score</Text>
              </View>
              <Text
                style={[
                  styles.passBadge,
                  {
                    backgroundColor: activity.passed
                      ? isDark
                        ? "#064e3b"
                        : "#e2f9cc"
                      : isDark
                        ? "#7f1d1d"
                        : "#f1f5f9",
                    color: activity.passed
                      ? isDark
                        ? "#34d399"
                        : "#3f6212"
                      : isDark
                        ? "#f87171"
                        : "#475569",
                  },
                ]}
              >
                {activity.passed ? "Passed" : "Failed"}
              </Text>
            </View>

            <View
              style={[
                styles.sectionCard,
                isDark && { backgroundColor: "#1e1f2a", borderColor: "#2d2d3a" },
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && { color: "#cbd5e1" }]}>CEFR Levels</Text>
              <View style={styles.cefrContainer}>
                <View
                  style={[
                    styles.cefrBox,
                    isDark && { backgroundColor: "#151620", borderColor: "#242635" },
                  ]}
                >
                  <Text style={[styles.cefrLabel, isDark && { color: "#a1a1aa" }]}>
                    Target Band
                  </Text>
                  <Text style={[styles.cefrValue, isDark && { color: "#ffffff" }]}>
                    {targetCefr}
                  </Text>
                </View>
                <View
                  style={[
                    styles.cefrBox,
                    isDark && { backgroundColor: "#151620", borderColor: "#242635" },
                  ]}
                >
                  <Text style={[styles.cefrLabel, isDark && { color: "#a1a1aa" }]}>
                    Achieved Band
                  </Text>
                  <Text
                    style={[
                      styles.cefrValue,
                      {
                        color: activity.passed
                          ? isDark
                            ? "#34d399"
                            : "#84cc16"
                          : isDark
                            ? "#f87171"
                            : "#64748b",
                      },
                    ]}
                  >
                    {cefr}
                  </Text>
                </View>
              </View>
            </View>

            {errors.length > 0 ? (
              <View
                style={[
                  styles.sectionCard,
                  isDark && { backgroundColor: "#1e1f2a", borderColor: "#2d2d3a" },
                ]}
              >
                <Text style={[styles.sectionTitle, isDark && { color: "#cbd5e1" }]}>
                  Grammar & Spelling Notes
                </Text>
                {errors.map((err: string, i: number) => (
                  <View key={i} style={styles.errorItem}>
                    <Feather
                      name="alert-circle"
                      size={14}
                      color="#ef4444"
                      style={styles.errorIcon}
                    />
                    <Text style={[styles.errorText, isDark && { color: "#cbd5e1" }]}>{err}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {activity.feedback ? (
              <View
                style={[
                  styles.sectionCard,
                  isDark && { backgroundColor: "#1e1f2a", borderColor: "#2d2d3a" },
                ]}
              >
                <Text style={[styles.sectionTitle, isDark && { color: "#cbd5e1" }]}>
                  AI Writing Mentor Feedback
                </Text>
                <Text style={[styles.feedbackText, isDark && { color: "#cbd5e1" }]}>
                  {activity.feedback}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CONFETTI_COLORS = [
  "#4f46e5",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#f43f5e",
];
const PARTICLE_COUNT = 60;

interface ConfettiParticleProps {
  color: string;
  delay: number;
}

function ConfettiParticle({ color, delay }: ConfettiParticleProps) {
  const progress = useRef(new Animated.Value(0)).current;

  const xStart = Math.random() * SCREEN_WIDTH;
  const xEnd = xStart + (Math.random() * 100 - 50);
  const yStart = -20;
  const yEnd = SCREEN_HEIGHT + 50;

  const isCircle = Math.random() > 0.5;
  const size = Math.random() * 8 + 6;
  const aspectRatio = Math.random() > 0.5 ? 1 : 1.5;
  const scale = Math.random() * 0.4 + 0.6;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: Math.random() * 2500 + 2000,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [yStart, yEnd],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [xStart, xEnd],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${Math.random() * 720}deg`],
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size * aspectRatio,
          height: size,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 0,
          transform: [{ translateX }, { translateY }, { rotate }, { scale }],
          opacity: 0.85,
        },
      ]}
    />
  );
}

function ConfettiShower() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <ConfettiParticle
          key={i}
          color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]!}
          delay={Math.random() * 1500}
        />
      ))}
    </View>
  );
}

function CelebrationModal({
  visible,
  onClose,
  dayNumber,
  totalXp,
}: {
  visible: boolean;
  onClose: () => void;
  dayNumber: string;
  totalXp: number;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.celebrationBackdrop}>
        <ConfettiShower />
        <View
          style={[
            styles.celebrationContent,
            isDark && { backgroundColor: "#151620", borderColor: "#242635" },
          ]}
        >
          <View style={{ alignItems: "center", width: "100%" }}>
            <LottieView
              source={require("../../assets/lottie/trophy.json")}
              autoPlay
              loop
              style={{ width: 180, height: 180 }}
            />
            <Text style={[styles.celebrationTitle, isDark && { color: "#ffffff" }]}>
              Day Completed!
            </Text>
            <Text style={[styles.celebrationSubtitle, isDark && { color: "#a1a1aa" }]}>
              Fantastic job! You have successfully completed all activities for Day {dayNumber} and
              unlocked your completion bonus!
            </Text>

            <View
              style={[
                styles.xpContainer,
                isDark && { backgroundColor: "#1c1917", borderColor: "#2e2a24" },
              ]}
            >
              <Text style={[styles.xpTextTotal, isDark && { color: "#ffffff" }]}>
                Total XP Earned Today:{" "}
                <Text style={{ color: "#3b82f6", fontWeight: "900" }}>{totalXp + 50} XP</Text>
              </Text>
              <Text style={[styles.xpTextSub, isDark && { color: "#a1a1aa" }]}>
                ({totalXp} XP activities + 50 XP completion bonus)
              </Text>
            </View>

            <View style={styles.bonusRow}>
              <View style={[styles.bonusBadge, isDark && { backgroundColor: "#1e1b4b" }]}>
                <Feather name="zap" size={16} color="#bef264" />
                <Text style={[styles.bonusText, isDark && { color: "#bef264" }]}>
                  +50 XP Bonus Unlocked
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={{ width: "100%", borderRadius: 9999, overflow: "hidden", marginTop: 24 }}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={["#4f46e5", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.primaryButton, pressed && { opacity: 0.95 }]}
                >
                  <Text style={styles.primaryButtonText}>Awesome! 🚀</Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function DailyResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    day_id?: string;
    module_id?: string;
    day_number?: string;
  }>();

  const dayId = params.day_id ?? "";
  const moduleId = params.module_id ?? "";
  const dayNumber = params.day_number ?? "";

  const {
    data: results,
    refetch,
    isLoading: resultsLoading,
  } = useGetDayResultsQuery(dayId, {
    skip: !dayId,
  });
  const { refetch: refetchProfile } = useGetProfileQuery();
  const [advanceDay, { isLoading: advancing }] = useAdvanceDayMutation();

  const [activeSpeakingModal, setActiveSpeakingModal] = useState<ActivityResultDetail | null>(null);
  const [activeWritingModal, setActiveWritingModal] = useState<ActivityResultDetail | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Mark first-run completion in local storage so timeline Day Tap always goes here
  useEffect(() => {
    if (dayId) {
      AsyncStorage.setItem(`day_first_run_completed_${dayId}`, "true").catch((err) => {
        console.warn("Failed to set day completed flag:", err);
      });
    }
  }, [dayId]);

  const isDayPassed = !!results?.all_evaluations_completed && !!results?.all_activities_passed;

  useEffect(() => {
    if (isDayPassed && !hasCelebrated) {
      setShowCelebration(true);
      setHasCelebrated(true);
    }
  }, [isDayPassed, hasCelebrated]);

  // SSE Subscription logic for pending/processing results
  useEffect(() => {
    const activeClosers: Array<() => void> = [];

    if (results?.activities) {
      results.activities.forEach((act) => {
        const skillLower = String(act.skill_type || "").toLowerCase();
        const nameLower = String(act.activity_name || "").toLowerCase();
        const isSpeaking = skillLower === "speaking" || nameLower.includes("speaking");
        const isWriting = skillLower === "writing" || nameLower.includes("writing");

        if (
          (isSpeaking || isWriting) &&
          act.response_id &&
          (act.evaluation_status === "PENDING" || act.evaluation_status === "PROCESSING")
        ) {
          const type = isSpeaking ? ("speaking" as const) : ("writing" as const);
          subscribeToEvaluationStatus(act.response_id, type, {
            onEvent: (event) => {
              if (event.status === "COMPLETED" || event.status === "FAILED") {
                refetch();
                refetchProfile();
              }
            },
            onError: (err) => {
              console.warn(`SSE subscription error on response ${act.response_id}:`, err);
            },
          }).then((closeFn) => {
            activeClosers.push(closeFn);
          });
        }
      });
    }

    return () => {
      activeClosers.forEach((close) => close());
    };
  }, [results, refetch, refetchProfile]);

  // Polling fallback while any activity is pending evaluation
  useEffect(() => {
    if (!dayId || !results) return;

    const hasPending = results.activities.some(
      (act) => act.evaluation_status === "PENDING" || act.evaluation_status === "PROCESSING",
    );

    if (!hasPending) return;

    const interval = setInterval(() => {
      refetch();
      refetchProfile();
    }, 3000);

    return () => clearInterval(interval);
  }, [results, dayId, refetch, refetchProfile]);

  const handleAdvance = async () => {
    if (!dayId) return;
    try {
      const res = await advanceDay(dayId).unwrap();
      if (res.advanced) {
        // Navigates home/timeline on completion
        router.replace("/(tabs)/my-learning");
      }
    } catch (e: any) {
      console.warn("Advance day failed:", e);
    }
  };

  const handleRetry = () => {
    if (!dayId) return;
    router.replace({
      pathname: "/learning-journey/module/[day_id]" as never,
      params: {
        day_id: dayId,
        module_id: moduleId,
        day_number: dayNumber,
      },
    });
  };

  const goHome = () => {
    router.replace("/(tabs)/my-learning");
  };

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (resultsLoading || !results) {
    return <GamifiedMascotLoader title="Loading Results..." subtitle="Please wait..." />;
  }

  const totalActivities = results.activities.length;
  const passedActivities = results.activities.filter((a) => a.passed).length;
  const passedPct =
    totalActivities > 0 ? Math.round((passedActivities / totalActivities) * 100) : 0;
  const allCompleted = results.all_evaluations_completed;
  const allPassed = results.all_activities_passed;
  const canAdvance = allCompleted && allPassed;

  return (
    <View
      style={[
        styles.container,
        isDark && { backgroundColor: "#0e0e11" },
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View
        style={[styles.header, isDark && { backgroundColor: "#0e0e11", borderColor: "#27272a" }]}
      >
        <Pressable onPress={goHome} style={styles.headerBack}>
          <Feather name="chevron-left" size={24} color={isDark ? "#ffffff" : "#0f172a"} />
        </Pressable>
        <Text style={[styles.headerTitle, isDark && { color: "#ffffff" }]}>
          Day {dayNumber} Results
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Aggregated XP Card */}
        <View
          style={[styles.xpCard, isDark && { backgroundColor: "#1e1f2a", borderColor: "#27272a" }]}
        >
          <Text style={[styles.xpCardTitle, isDark && { color: "#a1a1aa" }]}>Day Summary</Text>
          <View style={styles.xpRow}>
            <LinearGradient
              colors={isDark ? ["#1e1f2a", "#1e1f2a"] : ["#4f46e5", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.xpStatCard, isDark && { borderWidth: 1, borderColor: "#2d2d3a" }]}
            >
              <Text style={styles.xpStatCardValue}>+{results.total_day_xp}</Text>
              <Text style={[styles.xpStatCardLabel, isDark && { color: "#a1a1aa" }]}>
                XP Earned Today
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={isDark ? ["#1e1f2a", "#1e1f2a"] : ["#4f46e5", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.xpStatCard, isDark && { borderWidth: 1, borderColor: "#2d2d3a" }]}
            >
              <Text style={styles.xpStatCardValue}>{results.current_total_xp}</Text>
              <Text style={[styles.xpStatCardLabel, isDark && { color: "#a1a1aa" }]}>
                Total XP Points
              </Text>
            </LinearGradient>
          </View>

          <View style={[styles.statusBreakdown, isDark && { borderColor: "#2d2d3a" }]}>
            <Text style={[styles.statusText, isDark && { color: "#a1a1aa" }]}>
              Passed:{" "}
              <Text style={[styles.statusHighlight, isDark && { color: "#ffffff" }]}>
                {passedActivities}
              </Text>
              {"  ·  "}
              Failed:{" "}
              <Text style={[styles.statusHighlight, isDark && { color: "#ffffff" }]}>
                {results.failed_count}
              </Text>
              {results.pending_count > 0 ? (
                <>
                  {"  ·  "}
                  Evaluating:{" "}
                  <Text style={[styles.statusHighlight, { color: "#3b82f6" }]}>
                    {results.pending_count}
                  </Text>
                </>
              ) : null}
            </Text>
          </View>

          {/* Passed Activities Progress Bar */}
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarInfo}>
              <Text style={[styles.progressBarLabel, isDark && { color: "#a1a1aa" }]}>
                {passedActivities} / {totalActivities} Passed
              </Text>
              <Text style={[styles.progressBarPct, isDark && { color: "#ffffff" }]}>
                {passedPct}%
              </Text>
            </View>
            <View style={[styles.progressBarBg, isDark && { backgroundColor: "#21212b" }]}>
              <LinearGradient
                colors={isDark ? ["#3b82f6", "#3b82f6"] : ["#3b82f6", "#bef264"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${passedPct}%`, height: "100%", borderRadius: 9999 }}
              />
            </View>
          </View>
        </View>

        {/* Activity Status Cards */}
        <Text style={[styles.sectionTitleHeader, isDark && { color: "#cbd5e1" }]}>Activities</Text>
        {results.activities.map((act) => {
          const skillLower = String(act.skill_type || "").toLowerCase();
          const nameLower = String(act.activity_name || "").toLowerCase();
          const isSpeaking = skillLower === "speaking" || nameLower.includes("speaking");
          const isWriting = skillLower === "writing" || nameLower.includes("writing");
          const isPending =
            act.evaluation_status === "PENDING" || act.evaluation_status === "PROCESSING";

          let statusIcon = (
            <Feather name="help-circle" size={12} color={isDark ? "#a1a1aa" : "#64748b"} />
          );
          let statusLabel = "Not Started";
          let badgeBg = isDark ? "#27272a" : "#f1f5f9";
          let badgeTextColor = isDark ? "#cbd5e1" : "#475569";

          if (isPending) {
            statusIcon = (
              <ActivityIndicator
                size="small"
                color="#3b82f6"
                style={{ transform: [{ scale: 0.8 }] }}
              />
            );
            statusLabel = "Evaluating";
            badgeBg = isDark ? "#172554" : "#dbeafe";
            badgeTextColor = isDark ? "#60a5fa" : "#1e40af";
          } else if (act.passed) {
            statusIcon = (
              <Feather name="check-circle" size={12} color={isDark ? "#34d399" : "#3f6212"} />
            );
            statusLabel = "Passed";
            badgeBg = isDark ? "#064e3b" : "#e2f9cc";
            badgeTextColor = isDark ? "#34d399" : "#3f6212";
          } else if (act.evaluation_status === "COMPLETED" || act.evaluation_status === "FAILED") {
            statusIcon = (
              <Feather name="x-circle" size={12} color={isDark ? "#cbd5e1" : "#475569"} />
            );
            statusLabel = "Failed";
            badgeBg = isDark ? "#27272a" : "#f1f5f9";
            badgeTextColor = isDark ? "#cbd5e1" : "#475569";
          }

          const hasDetail = (isSpeaking || isWriting) && !isPending && act.score !== null;
          const isFailed =
            !isPending &&
            !act.passed &&
            (act.evaluation_status === "COMPLETED" ||
              act.evaluation_status === "FAILED" ||
              act.score !== null);

          let activityIcon: React.ComponentProps<typeof Feather>["name"] = "book-open";
          if (isSpeaking) activityIcon = "mic";
          else if (isWriting) activityIcon = "edit-3";

          return (
            <Pressable
              key={act.activity_id}
              disabled={!hasDetail}
              onPress={() => {
                if (isSpeaking) setActiveSpeakingModal(act);
                if (isWriting) setActiveWritingModal(act);
              }}
              style={({ pressed }) => [
                styles.activityCard,
                isDark && { backgroundColor: "#1e1f2a", borderColor: "#27272a" },
                hasDetail && pressed && { opacity: 0.95 },
              ]}
            >
              <View style={styles.activityCardRow}>
                <LinearGradient
                  colors={isDark ? ["#27272a", "#1e1f2a"] : ["#4f46e5", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activityIconBox}
                >
                  <Feather name={activityIcon} size={20} color="#ffffff" />
                </LinearGradient>

                <View style={styles.activityMainContent}>
                  <Text style={[styles.activityName, isDark && { color: "#ffffff" }]}>
                    {isSpeaking
                      ? "🗣️ Speaking Practice"
                      : isWriting
                        ? "✍️ Writing Practice"
                        : `📖 ${act.activity_name}`}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                      {statusIcon}
                      <Text style={[styles.statusBadgeText, { color: badgeTextColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                    {act.score !== null && !isPending && (
                      <Text style={[styles.cardScoreTextInline, isDark && { color: "#a1a1aa" }]}>
                        Score: {Math.round(act.score)}%
                      </Text>
                    )}
                  </View>
                </View>

                {act.score !== null && !isPending && (
                  <View style={styles.scoreContainer}>
                    <Text style={styles.cardXpText}>+{act.xp_earned} XP</Text>
                  </View>
                )}

                <View style={styles.rightActionContainer}>
                  {isPending ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : act.passed ? (
                    <View
                      style={[
                        styles.circleBadge,
                        isDark ? { backgroundColor: "#064e3b" } : { backgroundColor: "#bef264" },
                      ]}
                    >
                      <Feather
                        name={hasDetail ? "chevron-right" : "check"}
                        size={16}
                        color={isDark ? "#34d399" : "#1e293b"}
                      />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.circleBadge,
                        { backgroundColor: isDark ? "#27272a" : "#f1f5f9" },
                      ]}
                    >
                      <Feather
                        name={hasDetail ? "chevron-right" : "x"}
                        size={16}
                        color={isDark ? "#cbd5e1" : "#64748b"}
                      />
                    </View>
                  )}
                </View>
              </View>

              {hasDetail && act.feedback ? (
                <View
                  style={[
                    styles.cardFeedbackContainer,
                    isDark && { backgroundColor: "#151620", borderColor: "#242635" },
                  ]}
                >
                  <View style={styles.cardFeedbackHeader}>
                    <Feather
                      name="message-square"
                      size={12}
                      color={isDark ? "#a1a1aa" : "#64748b"}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.cardFeedbackTitle, isDark && { color: "#a1a1aa" }]}>
                      {isSpeaking ? "AI Speaking Coach Feedback" : "AI Writing Mentor Feedback"}
                    </Text>
                  </View>
                  <Text
                    style={[styles.cardFeedbackText, isDark && { color: "#cbd5e1" }]}
                    numberOfLines={2}
                  >
                    {act.feedback}
                  </Text>
                </View>
              ) : null}

              {hasDetail ? (
                <View style={[styles.detailRow, isDark && { borderColor: "#2d2d3a" }]}>
                  <Text style={styles.detailLink}>Tap to view AI scoring & detailed feedback</Text>
                  <Feather name="chevron-right" size={14} color="#3b82f6" />
                </View>
              ) : null}

              {isFailed && (
                <Pressable
                  onPress={() => {
                    router.replace({
                      pathname: "/learning-journey/module/[day_id]" as never,
                      params: {
                        day_id: dayId,
                        module_id: moduleId,
                        day_number: dayNumber,
                        retake_activity_id: act.activity_id,
                      },
                    });
                  }}
                  style={({ pressed }) => [
                    styles.retakeRow,
                    isDark && { borderColor: "#2d2d3a" },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.retakeText}>Retake this activity to improve score</Text>
                  <Feather name="rotate-ccw" size={14} color="#3b82f6" />
                </Pressable>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Advancement Flow CTAs */}
      <View
        style={[styles.footer, isDark && { backgroundColor: "#0e0e11", borderColor: "#27272a" }]}
      >
        {!allCompleted ? (
          <View
            style={[
              styles.pendingFooter,
              isDark && { backgroundColor: "#2e2109", borderColor: "#5c3e0b" },
            ]}
          >
            <ActivityIndicator size="small" color="#f59e0b" style={{ marginRight: 8 }} />
            <Text style={[styles.pendingFooterText, isDark && { color: "#f59e0b" }]}>
              AI mentors are analyzing your speaking/writing. Please wait...
            </Text>
          </View>
        ) : null}

        {canAdvance ? (
          <Pressable
            onPress={handleAdvance}
            disabled={advancing}
            style={{ width: "100%", borderRadius: 9999, overflow: "hidden" }}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={
                  isDark
                    ? ["#27272a", "#1e1f2a"]
                    : pressed
                      ? ["#3730a3", "#2563eb"]
                      : ["#4f46e5", "#3b82f6"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.primaryButton, advancing && { opacity: 0.6 }]}
              >
                {advancing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Continue To Next Day (+50 XP Bonus) 🚀
                  </Text>
                )}
              </LinearGradient>
            )}
          </Pressable>
        ) : (
          <View style={styles.lockedContainer}>
            {allCompleted && !allPassed ? (
              <>
                <Text style={[styles.lockedMessage, isDark && { color: "#a1a1aa" }]}>
                  You must pass all activities (score ≥ 60%) to advance.
                </Text>
                <Pressable
                  onPress={handleRetry}
                  style={{ width: "100%", borderRadius: 9999, overflow: "hidden" }}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={
                        isDark
                          ? ["#27272a", "#27272a"]
                          : pressed
                            ? ["#2563eb", "#1d4ed8"]
                            : ["#3b82f6", "#2563eb"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>Retry Failed Activities</Text>
                    </LinearGradient>
                  )}
                </Pressable>
              </>
            ) : (
              <Pressable
                disabled
                style={[
                  styles.primaryButton,
                  { backgroundColor: isDark ? "#27272a" : "#e2e8f0", borderRadius: 9999 },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: isDark ? "#71717a" : "#94a3b8" }]}>
                  Continue To Next Day (Locked)
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <DetailedSpeakingModal
        visible={activeSpeakingModal !== null}
        onClose={() => setActiveSpeakingModal(null)}
        activity={activeSpeakingModal}
      />
      <DetailedWritingModal
        visible={activeWritingModal !== null}
        onClose={() => setActiveWritingModal(null)}
        activity={activeWritingModal}
      />
      <CelebrationModal
        visible={showCelebration}
        onClose={() => setShowCelebration(false)}
        dayNumber={dayNumber}
        totalXp={results?.total_day_xp ?? 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  xpCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  xpCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  xpStat: {
    alignItems: "center",
  },
  xpStatValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
  },
  xpStatLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 2,
  },
  xpStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#cbd5e1",
  },
  xpStatCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  xpStatCardValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
  },
  xpStatCardLabel: {
    fontSize: 10,
    color: "#e0e7ff",
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressBarWrapper: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
    paddingTop: 16,
  },
  progressBarInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressBarPct: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
    overflow: "hidden",
    width: "100%",
  },
  statusBreakdown: {
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
    paddingTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  statusHighlight: {
    color: "#0f172a",
    fontWeight: "700",
  },
  sectionTitleHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 12,
  },
  activityCardMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activityCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  activityMainContent: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  cardScoreTextInline: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginLeft: 10,
  },
  rightActionContainer: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  circleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  activityCardInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  scoreContainer: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  cardScoreText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  cardXpText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3b82f6",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
    paddingTop: 12,
    marginTop: 12,
  },
  detailLink: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6",
  },
  retakeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
    paddingTop: 12,
    marginTop: 12,
  },
  retakeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6",
  },
  footer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  pendingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  pendingFooterText: {
    fontSize: 12,
    color: "#b45309",
    fontWeight: "600",
    flex: 1,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  lockedContainer: {
    alignItems: "center",
  },
  lockedMessage: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  modalScroll: {
    padding: 24,
  },
  scoreCircleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginTop: -2,
  },
  passBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  transcriptText: {
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    color: "#1e293b",
    fontWeight: "500",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  metricBarBg: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    width: "100%",
    marginBottom: 16,
    overflow: "hidden",
  },
  metricBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
    fontWeight: "500",
  },
  cefrContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cefrBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cefrLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cefrValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  errorIcon: {
    marginTop: 3,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#475569",
    fontWeight: "500",
  },
  cardFeedbackContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginTop: 12,
  },
  cardFeedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardFeedbackTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardFeedbackText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#334155",
    fontWeight: "500",
  },
  celebrationBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  celebrationContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#4f46e5",
    marginTop: 12,
    textAlign: "center",
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  bonusRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  bonusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
    marginLeft: 6,
  },
  xpContainer: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  xpTextTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  xpTextSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "600",
  },
});
