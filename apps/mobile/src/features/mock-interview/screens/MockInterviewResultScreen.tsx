/**
 * src/features/mock-interview/screens/MockInterviewResultScreen.tsx
 *
 * Mock Interview Result Screen — Full Report Edition.
 *
 * Sections (matches FullReportScreen spec):
 *  ✔ Header with back button + session title
 *  ✔ Overall score ring (animated double-ring)
 *  ✔ Interview details (type, date, duration, questions)
 *  ✔ AI Summary / Gap Analysis card
 *  ✔ Category breakdown with animated score bars
 *  ✔ Expandable per-question cards (answer · feedback · score bar)
 *  ✔ Strengths & Improvements section
 *  ✔ Next Steps list (dynamic from API, static fallback)
 *  ✔ Download PDF button
 *  ✔ Share Results button (native Share sheet)
 *  ✔ Practice Again / Back to Sessions actions
 *
 * Data source: useLazyGetMockInterviewResultQuery (existing API, unchanged)
 * Navigation:  NavigationBridge (existing, unchanged)
 */

import { logger } from "@/utils/logger";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLazyGetMockInterviewResultQuery } from "@/services/mockInterviewApiSlice";
import type { NavigationBridge } from "@/utils/navigationBridge";
import type { SessionParam } from "@/types/mockInterview";

// ─────────────────────────────────────────────────────────────────────────────
// PROPS & ROUTE TYPES  (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

interface MockInterviewResultRouteParams {
  session?: SessionParam;
}
interface MockInterviewResultRoute {
  key?: string;
  name?: string;
  params?: MockInterviewResultRouteParams;
}
interface Props {
  route?: MockInterviewResultRoute;
  navigation: NavigationBridge;
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND PAYLOAD TYPES  (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

interface BackendResponseItem {
  question_text?: string;
  confidence_score?: number;
  feedback?: string;
  user_answer?: string;
  is_correct?: boolean;
}
interface BackendResultPayload {
  responses?: BackendResponseItem[];
  gap_analysis?: string;
  created_at?: string;
  duration?: number;
  interview_type?: string;
  next_steps?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALISED UI MODELS  (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

interface NormalizedCategory {
  name: string;
  icon: string;
  score: number;
}
interface NormalizedFeedbackItem {
  type: "strength" | "improvement";
  title: string;
  description: string;
}
interface NormalizedQuestion {
  question: string;
  score: number;
  feedback: string;
  userAnswer: string;
  isCorrect?: boolean;
}
interface NormalizedResult {
  overallScore: number;
  categories: NormalizedCategory[];
  feedback: NormalizedFeedbackItem[];
  questions: NormalizedQuestion[];
  gapAnalysis: string;
  createdAt: string;
  duration: number;
  interviewType: string;
  nextSteps: string[];
}

const EMPTY_RESULT: NormalizedResult = {
  overallScore: 0,
  categories: [],
  feedback: [],
  questions: [],
  gapAnalysis: "",
  createdAt: "",
  duration: 0,
  interviewType: "mock",
  nextSteps: [],
};

const DEFAULT_NEXT_STEPS = [
  "Practice mock interviews regularly to build confidence.",
  "Reduce filler words (um, uh, like) in your answers.",
  "Apply the STAR method — always state a measurable Result.",
  "Quantify achievements with specific numbers where possible.",
  "Review model answers to benchmark your responses.",
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmtDate = (iso?: string): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const fmtDuration = (sec?: number): string => {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m} min`;
};

const capitalize = (s?: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

const scoreColor = (s: number): string => (s >= 85 ? "#10B981" : s >= 70 ? "#F59E0B" : "#EF4444");

const scoreBg = (s: number): string => (s >= 85 ? "#DCFCE7" : s >= 70 ? "#FEF3C7" : "#FEE2E2");

const perfLabel = (s: number): string =>
  s >= 85 ? "Excellent" : s >= 70 ? "Good" : s >= 50 ? "Average" : "Needs Improvement";

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Key/value detail row */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

/** Animated horizontal score bar */
function ScoreBar({ label, score }: { label: string; score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(100, score),
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [score, anim]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.scoreBarRow}>
      <Text style={styles.scoreBarLabel}>{label}</Text>
      <View style={styles.scoreBarTrack}>
        <Animated.View
          style={[styles.scoreBarFill, { width, backgroundColor: scoreColor(score) }]}
        />
      </View>
      <Text style={[styles.scoreBarValue, { color: scoreColor(score) }]}>{score}</Text>
    </View>
  );
}

/** Expandable per-question card */
function ExpandableQuestion({ index, item }: { index: number; item: NormalizedQuestion }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    Animated.timing(anim, {
      toValue: open ? 0 : 1,
      duration: 280,
      useNativeDriver: false,
    }).start();
    setOpen((p) => !p);
  }, [open, anim]);

  const maxH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 260] });
  const color = scoreColor(item.score);
  const bg = scoreBg(item.score);

  return (
    <View style={styles.qCard}>
      {/* Collapsed header */}
      <TouchableOpacity style={styles.qHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={styles.qIndexBadge}>
          <Text style={styles.qIndexText}>Q{index}</Text>
        </View>
        <Text style={styles.qText} numberOfLines={open ? undefined : 2}>
          {item.question}
        </Text>
        <View style={[styles.qScoreBadge, { backgroundColor: bg }]}>
          <Text style={[styles.qScoreText, { color }]}>{item.score}%</Text>
        </View>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#9CA3AF"
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {/* Animated expand body */}
      <Animated.View style={{ maxHeight: maxH, overflow: "hidden" }}>
        <View style={styles.qBodyInner}>
          {/* User answer */}
          <View style={styles.qAnswerBox}>
            <Text style={styles.qAnswerLabel}>Your Answer</Text>
            <Text style={styles.qAnswerText}>{item.userAnswer || "No answer provided"}</Text>
          </View>

          {/* Feedback */}
          {!!item.feedback && (
            <View style={styles.qFeedbackBox}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color="#F59E0B" />
              <Text style={styles.qFeedbackText}>{item.feedback}</Text>
            </View>
          )}

          {/* Correctness chip */}
          {item.isCorrect !== undefined && (
            <View
              style={[
                styles.qCorrectnessChip,
                { backgroundColor: item.isCorrect ? "#DCFCE7" : "#FEE2E2" },
              ]}
            >
              <Ionicons
                name={item.isCorrect ? "checkmark-circle" : "close-circle"}
                size={14}
                color={item.isCorrect ? "#16A34A" : "#DC2626"}
              />
              <Text
                style={[styles.qCorrectnessText, { color: item.isCorrect ? "#16A34A" : "#DC2626" }]}
              >
                {item.isCorrect ? "Correct" : "Needs improvement"}
              </Text>
            </View>
          )}

          {/* Score bar */}
          <ScoreBar label="Score" score={item.score} />
        </View>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function MockInterviewResultScreen({ route, navigation }: Props) {
  const session = route?.params?.session || {};
  const sessionTitle = (session as { title?: string })?.title || "Mock Interview";
  const sessionId = (session as { id?: string })?.id || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<BackendResultPayload | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [triggerGetMockInterviewResult] = useLazyGetMockInterviewResultQuery();

  useEffect(() => {
    fetchResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Data fetch (unchanged logic) ───────────────────────────────────────────

  const fetchResult = async (): Promise<void> => {
    try {
      if (!sessionId) throw new Error("Session ID not found.");
      const queryResult = await triggerGetMockInterviewResult(sessionId);
      if (queryResult.error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errData = (queryResult.error as any)?.data;
        throw new Error(
          errData?.message ||
            errData?.detail ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (queryResult.error as any)?.error ||
            "Failed to load result.",
        );
      }
      setResult(queryResult.data as BackendResultPayload);
    } catch (error) {
      logger.log("Failed to fetch mock result:", error);
      Alert.alert("Error", (error as Error)?.message || "Failed to load result.");
    } finally {
      setLoading(false);
    }
  };

  // ── Normalise (extended from original) ────────────────────────────────────

  const normalizedResult = useMemo<NormalizedResult>(() => {
    if (!result) return EMPTY_RESULT;

    const responses: BackendResponseItem[] = Array.isArray(result.responses)
      ? result.responses
      : [];

    const confidenceValues: number[] = responses
      .map((item) =>
        typeof item.confidence_score === "number"
          ? Math.round(
              item.confidence_score <= 1 ? item.confidence_score * 100 : item.confidence_score,
            )
          : null,
      )
      .filter((v): v is number => v !== null);

    const overallScore: number = confidenceValues.length
      ? Math.round(confidenceValues.reduce((s, v) => s + v, 0) / confidenceValues.length)
      : 0;

    const questions: NormalizedQuestion[] = responses.map((item) => ({
      question: item.question_text || "Question",
      score:
        typeof item.confidence_score === "number"
          ? Math.round(
              item.confidence_score <= 1 ? item.confidence_score * 100 : item.confidence_score,
            )
          : 0,
      feedback: item.feedback || "",
      userAnswer: item.user_answer || "",
      isCorrect: item.is_correct,
    }));

    const strongResponses = responses.filter(
      (i) => i.feedback && !i.feedback.toLowerCase().includes("improve"),
    );
    const improvementResponses = responses.filter(
      (i) =>
        i.feedback &&
        (i.feedback.toLowerCase().includes("improve") ||
          i.feedback.toLowerCase().includes("missing") ||
          i.feedback.toLowerCase().includes("add") ||
          i.feedback.toLowerCase().includes("better")),
    );

    const feedback: NormalizedFeedbackItem[] = [
      ...strongResponses.slice(0, 2).map(
        (i): NormalizedFeedbackItem => ({
          type: "strength",
          title: "Strong Response",
          description: i.feedback || "",
        }),
      ),
      ...improvementResponses.slice(0, 2).map(
        (i): NormalizedFeedbackItem => ({
          type: "improvement",
          title: "Needs Improvement",
          description: i.feedback || "",
        }),
      ),
    ];

    const categories: NormalizedCategory[] = [
      { name: "Confidence", icon: "analytics-outline", score: overallScore },
      {
        name: "Correctness",
        icon: "checkmark-done-outline",
        score: responses.length
          ? Math.round(
              (responses.filter((i) => i.is_correct === true).length / responses.length) * 100,
            )
          : 0,
      },
      { name: "Clarity", icon: "chatbubble-ellipses-outline", score: overallScore },
    ];

    // Dynamic next steps from API, fall back to static list
    const nextSteps: string[] =
      Array.isArray(result.next_steps) && result.next_steps.length > 0
        ? result.next_steps
        : DEFAULT_NEXT_STEPS;

    return {
      overallScore,
      categories,
      feedback,
      questions,
      gapAnalysis: result.gap_analysis || "",
      createdAt: result.created_at || "",
      duration: result.duration || 0,
      interviewType: result.interview_type || "mock",
      nextSteps,
    };
  }, [result]);

  // ── Share handler ──────────────────────────────────────────────────────────

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      await Share.share({
        title: "My Mock Interview Results",
        message:
          `Mock Interview Results\n` +
          `Score: ${normalizedResult.overallScore}% — ${perfLabel(normalizedResult.overallScore)}\n` +
          `${normalizedResult.questions.length} questions · ${fmtDate(normalizedResult.createdAt)}`,
      });
    } catch {
      Alert.alert("Share Failed", "Unable to open the share sheet.");
    } finally {
      setIsSharing(false);
    }
  }, [normalizedResult]);

  // ── Download handler (placeholder — wire to real PDF if API provides URL) ─

  const handleDownloadPdf = useCallback(() => {
    Alert.alert(
      "Download Report",
      "Your report PDF is being prepared. This feature will be available once the session is fully processed.",
      [{ text: "OK" }],
    );
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading interview analysis…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const { overallScore, categories, feedback, questions, gapAnalysis, nextSteps } =
    normalizedResult;
  const color = scoreColor(overallScore);
  const label = perfLabel(overallScore);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      {/* ── HEADER ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#2563EB" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Full Interview Report</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {sessionTitle}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── OVERALL SCORE RING ── */}
        <View style={styles.scoreCard}>
          <View style={[styles.scoreRingOuter, { borderColor: color + "30" }]}>
            <View style={[styles.scoreRingInner, { borderColor: color }]}>
              <Text style={[styles.scoreNumber, { color }]}>{overallScore}</Text>
              <Text style={styles.scoreSubLabel}>{label}</Text>
            </View>
          </View>
          <Text style={styles.scoreCardTitle}>Overall Performance</Text>
          <Text style={styles.scoreCardSub}>
            Based on {questions.length} question{questions.length !== 1 ? "s" : ""} answered
          </Text>
        </View>

        {/* ── INTERVIEW DETAILS ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>INTERVIEW DETAILS</Text>
          <DetailRow label="Type" value={capitalize(normalizedResult.interviewType)} />
          <View style={styles.divider} />
          <DetailRow label="Date" value={fmtDate(normalizedResult.createdAt)} />
          <View style={styles.divider} />
          <DetailRow label="Duration" value={fmtDuration(normalizedResult.duration)} />
          <View style={styles.divider} />
          <DetailRow label="Questions" value={String(questions.length)} />
        </View>

        {/* ── AI SUMMARY / GAP ANALYSIS ── */}
        {!!gapAnalysis && (
          <View style={[styles.card, styles.aiCard]}>
            <View style={styles.aiHeader}>
              <MaterialCommunityIcons name="robot-outline" size={18} color="#2563EB" />
              <Text style={styles.aiTitle}>AI Summary</Text>
            </View>
            <Text style={styles.aiBody}>{gapAnalysis}</Text>
          </View>
        )}

        {/* ── CATEGORY BREAKDOWN ── */}
        {categories.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>CATEGORY SCORES</Text>
            {categories.map((cat, i) => (
              <View key={i} style={styles.categoryRow}>
                <View style={styles.categoryIconWrap}>
                  <Ionicons name={cat.icon as never} size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <ScoreBar label={cat.name} score={cat.score} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── EXPANDABLE QUESTIONS ── */}
        {questions.length > 0 && (
          <View>
            <Text style={[styles.sectionLabel, { paddingHorizontal: 0 }]}>QUESTION BREAKDOWN</Text>
            <Text style={styles.sectionHint}>Tap a question to expand details</Text>
            {questions.map((q, i) => (
              <ExpandableQuestion key={i} index={i + 1} item={q} />
            ))}
          </View>
        )}

        {/* ── STRENGTHS & IMPROVEMENTS ── */}
        {feedback.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>FEEDBACK & INSIGHTS</Text>

            {/* Strengths */}
            {feedback.filter((f) => f.type === "strength").length > 0 && (
              <View style={styles.feedbackGroup}>
                <Text style={styles.feedbackGroupTitle}>Strengths</Text>
                {feedback
                  .filter((f) => f.type === "strength")
                  .map((item, i) => (
                    <View key={i} style={[styles.feedbackItem, styles.feedbackStrength]}>
                      <View style={styles.feedbackItemHeader}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.feedbackItemTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.feedbackItemDesc}>{item.description}</Text>
                    </View>
                  ))}
              </View>
            )}

            {/* Improvements */}
            {feedback.filter((f) => f.type === "improvement").length > 0 && (
              <View style={styles.feedbackGroup}>
                <Text style={styles.feedbackGroupTitle}>Areas for Improvement</Text>
                {feedback
                  .filter((f) => f.type === "improvement")
                  .map((item, i) => (
                    <View key={i} style={[styles.feedbackItem, styles.feedbackImprovement]}>
                      <View style={styles.feedbackItemHeader}>
                        <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                        <Text style={styles.feedbackItemTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.feedbackItemDesc}>{item.description}</Text>
                    </View>
                  ))}
              </View>
            )}
          </View>
        )}

        {/* ── NEXT STEPS ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>NEXT STEPS</Text>
          {nextSteps.map((step, i) => (
            <View key={i} style={styles.nextStepRow}>
              <View style={styles.nextStepDot} />
              <Text style={styles.nextStepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* ── DOWNLOAD + SHARE ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={handleDownloadPdf}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="download-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnTextWhite}>Download PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionBtnSecondary,
              isSharing && styles.actionBtnDisabled,
            ]}
            onPress={handleShare}
            disabled={isSharing}
            activeOpacity={0.85}
          >
            {isSharing ? (
              <ActivityIndicator color="#2563EB" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="share-variant-outline" size={18} color="#2563EB" />
                <Text style={styles.actionBtnTextBlue}>Share Results</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── VIEW FULL REPORT ── */}
        {!!sessionId && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: "#0F172A",
                borderRadius: 14,
                height: 52,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 8,
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/interview/report",
                params: { reportId: sessionId },
              } as never)
            }
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="file-chart-outline" size={18} color="#FFFFFF" />
            <Text style={[styles.actionBtnTextWhite, { fontSize: 15 }]}>View Full Report</Text>
          </TouchableOpacity>
        )}

        {/* ── PRACTICE AGAIN / BACK ── */}
        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate("MockInterviewSession", {
                sessionTitle: "New Mock Interview",
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Practice Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("MockInterviewList")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Back to Sessions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  android: { elevation: 3 },
  default: {},
});

const styles = StyleSheet.create({
  // ── Shell ──────────────────────────────────────────────────────────────────
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 48, gap: 16 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 12, fontSize: 14, color: "#64748B" },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  headerSub: { fontSize: 12, color: "#64748B", marginTop: 1 },

  // ── Card base ──────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    ...SHADOW,
  },

  // ── Score ring card ────────────────────────────────────────────────────────
  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    ...SHADOW,
  },
  scoreRingOuter: {
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scoreRingInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  scoreNumber: { fontSize: 38, fontWeight: "800" },
  scoreSubLabel: { fontSize: 12, fontWeight: "600", color: "#64748B", marginTop: 2 },
  scoreCardTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  scoreCardSub: { fontSize: 14, color: "#64748B", marginTop: 4 },

  // ── Section labels ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  sectionHint: { fontSize: 12, color: "#94A3B8", marginTop: -10, marginBottom: 12 },

  // ── Detail rows ────────────────────────────────────────────────────────────
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: { fontSize: 14, color: "#64748B", fontWeight: "500" },
  detailValue: { fontSize: 14, color: "#0F172A", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F1F5F9" },

  // ── AI card ────────────────────────────────────────────────────────────────
  aiCard: { backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  aiTitle: { fontSize: 14, fontWeight: "700", color: "#1D4ED8" },
  aiBody: { fontSize: 14, color: "#1E40AF", lineHeight: 22 },

  // ── Category rows ──────────────────────────────────────────────────────────
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  categoryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // ── Score bar ──────────────────────────────────────────────────────────────
  scoreBarRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  scoreBarLabel: { fontSize: 13, color: "#475569", fontWeight: "500", width: 100 },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: { height: 6, borderRadius: 3 },
  scoreBarValue: { fontSize: 13, fontWeight: "700", width: 36, textAlign: "right" },

  // ── Expandable question cards ──────────────────────────────────────────────
  qCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
    ...SHADOW,
  },
  qHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  qIndexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qIndexText: { fontSize: 12, fontWeight: "800", color: "#2563EB" },
  qText: { flex: 1, fontSize: 13, color: "#1E293B", fontWeight: "500", lineHeight: 18 },
  qScoreBadge: {
    minWidth: 42,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  qScoreText: { fontSize: 13, fontWeight: "700" },
  qBodyInner: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  qAnswerBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  qAnswerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  qAnswerText: { fontSize: 13, color: "#475569", lineHeight: 19 },
  qFeedbackBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  qFeedbackText: { flex: 1, fontSize: 13, color: "#92400E", lineHeight: 18 },
  qCorrectnessChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qCorrectnessText: { fontSize: 12, fontWeight: "600" },

  // ── Feedback items ─────────────────────────────────────────────────────────
  feedbackGroup: { marginBottom: 16 },
  feedbackGroupTitle: { fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 10 },
  feedbackItem: { borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4 },
  feedbackStrength: { backgroundColor: "#F0FDF4", borderLeftColor: "#10B981" },
  feedbackImprovement: { backgroundColor: "#FFFBEB", borderLeftColor: "#F59E0B" },
  feedbackItemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  feedbackItemTitle: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginLeft: 8 },
  feedbackItemDesc: { fontSize: 13, color: "#64748B", lineHeight: 19, marginLeft: 28 },

  // ── Next steps ─────────────────────────────────────────────────────────────
  nextStepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  nextStepDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2563EB",
    marginTop: 6,
    flexShrink: 0,
  },
  nextStepText: { flex: 1, fontSize: 14, color: "#334155", lineHeight: 20 },

  // ── Download + Share row ───────────────────────────────────────────────────
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 52,
    borderRadius: 14,
  },
  actionBtnPrimary: {
    backgroundColor: "#2563EB",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  actionBtnSecondary: { backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#BFDBFE" },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnTextWhite: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  actionBtnTextBlue: { color: "#2563EB", fontSize: 14, fontWeight: "700" },

  // ── Nav actions ────────────────────────────────────────────────────────────
  navActions: { gap: 12 },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryButtonText: { fontSize: 16, fontWeight: "600", color: "#64748B" },
});
