/**
 * src/features/interview/screens/FullReportScreen.tsx
 *
 * Full interview report screen.
 *
 * Features:
 *  - Interview details (type, date, duration, question count)
 *  - Overall score ring
 *  - AI summary card
 *  - Expandable per-question breakdown (answer · feedback · score bars)
 *  - Category score bars
 *  - Next steps list (from API focusAreas, with static fallback)
 *  - Download PDF (cross-platform via downloadReportPDF util)
 *  - Share results (native Share sheet + API share link)
 *
 * Route: /interview/full-report?reportId=<id>
 *        or legacy   ?sessionId=<id>  (backward-compat)
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  useGetFullReportQuery,
  useDownloadReportPdfMutation,
  useShareResultsMutation,
} from "../services/interviewFeedbackApi";
import { downloadReportPDF, handleDownloadError } from "@/utils/downloadReportPdf";
import type { Report } from "../types/interview.types";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_NEXT_STEPS = [
  "Practice mock interviews to build confidence.",
  "Reduce filler words (um, uh, like) in your answers.",
  "Improve the STAR method — always state a measurable Result.",
  "Quantify achievements with specific numbers or percentages.",
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

const scoreColor = (s: number): string => (s >= 80 ? "#22C55E" : s >= 60 ? "#F59E0B" : "#EF4444");

const scoreBg = (s: number): string => (s >= 80 ? "#DCFCE7" : s >= 60 ? "#FEF3C7" : "#FEE2E2");

const performanceLabel = (s: number): string =>
  s >= 85 ? "Excellent" : s >= 70 ? "Good" : s >= 50 ? "Average" : "Needs Improvement";

const trendIcon = (trend?: string) => {
  if (trend === "up") return { name: "trending-up" as const, color: "#22C55E" };
  if (trend === "down") return { name: "trending-down" as const, color: "#EF4444" };
  return { name: "minus" as const, color: "#9CA3AF" };
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Simple key/value detail row */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

/** Horizontal score bar with label */
function ScoreBar({
  label,
  score,
  maxScore = 100,
}: {
  label: string;
  score: number;
  maxScore?: number;
}) {
  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  return (
    <View style={styles.scoreBarRow}>
      <Text style={styles.scoreBarLabel}>{label}</Text>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${pct}%` as `${number}%`, backgroundColor: scoreColor(pct) },
          ]}
        />
      </View>
      <Text style={[styles.scoreBarValue, { color: scoreColor(pct) }]}>{score}</Text>
    </View>
  );
}

/** Expandable question card */
function ExpandableQuestion({ index, item }: { index: number; item: Report["questions"][number] }) {
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

  const maxH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] });
  const color = scoreColor(item.score);
  const bg = scoreBg(item.score);

  return (
    <View style={styles.qCard}>
      {/* ── Collapsed header ── */}
      <TouchableOpacity style={styles.qHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={styles.qIndexBadge}>
          <Text style={styles.qIndexText}>Q{index}</Text>
        </View>

        <Text style={styles.qText} numberOfLines={open ? undefined : 2}>
          {item.text}
        </Text>

        <View style={[styles.qScoreBadge, { backgroundColor: bg }]}>
          <Text style={[styles.qScoreText, { color }]}>{item.score}</Text>
        </View>

        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#9CA3AF"
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {/* ── Animated expand body ── */}
      <Animated.View style={[styles.qBody, { maxHeight: maxH, overflow: "hidden" }]}>
        <View style={styles.qBodyInner}>
          {/* Answer placeholder */}
          <View style={styles.qAnswerBox}>
            <Text style={styles.qAnswerLabel}>Your Answer</Text>
            <Text style={styles.qAnswerText}>Voice answer recorded</Text>
          </View>

          {/* Feedback */}
          {!!item.feedback && (
            <View style={styles.qFeedbackBox}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color="#F59E0B" />
              <Text style={styles.qFeedbackText}>{item.feedback}</Text>
            </View>
          )}

          {/* Score bar */}
          <ScoreBar label="Score" score={item.score} />

          {/* Duration */}
          {!!item.duration && <Text style={styles.qDuration}>⏱ {fmtDuration(item.duration)}</Text>}
        </View>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function FullReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reportId?: string; sessionId?: string }>();

  // Accept both reportId (new) and sessionId (legacy)
  const reportId = params?.reportId || params?.sessionId || "";

  console.log("Report ID:", reportId);

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFullReportQuery({ reportId }, { skip: !reportId });

  const [downloadPdfMutation, { isLoading: isDownloading }] = useDownloadReportPdfMutation();
  const [shareResultsMutation, { isLoading: isSharing }] = useShareResultsMutation();

  // Debug logs
  console.log("API Data:", report);
  console.log("Error:", error);

  // ── Derived values ──────────────────────────────────────────────────────────

  const avgScore = useMemo(() => {
    if (report?.overallScore) return report.overallScore;
    if (!report?.questions?.length) return 0;
    const total = report.questions.reduce((sum, q) => sum + (q.score ?? 0), 0);
    return Math.round(total / report.questions.length);
  }, [report]);

  const nextSteps = useMemo<string[]>(() => {
    // Use API-provided focus areas if available, fall back to static list
    const areas = (report as unknown as { focusAreas?: string[] })?.focusAreas;
    if (Array.isArray(areas) && areas.length > 0) return areas;
    return DEFAULT_NEXT_STEPS;
  }, [report]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDownloadPdf = useCallback(async () => {
    if (!reportId) {
      Alert.alert("Error", "Report ID is missing.");
      return;
    }
    try {
      const result = await downloadPdfMutation({ reportId }).unwrap();
      await downloadReportPDF(result, reportId);
      Alert.alert("Success", "Report downloaded successfully.");
    } catch (err) {
      Alert.alert("Download Failed", handleDownloadError(err));
    }
  }, [reportId, downloadPdfMutation]);

  const handleShare = useCallback(async () => {
    if (!reportId) return;

    // Try API share link first
    try {
      const result = await shareResultsMutation({
        reportId,
        type: "link",
      }).unwrap();

      if (result?.shareUrl) {
        await Share.share({
          title: "My Interview Results",
          message: `Check out my interview results: ${result.shareUrl}`,
          url: result.shareUrl,
        });
        return;
      }
    } catch {
      // API failed — fall back to native share with report data
    }

    // Fallback: share basic info via native sheet
    try {
      await Share.share({
        title: "My Interview Results",
        message: `Interview Report\nScore: ${avgScore}/100 — ${performanceLabel(avgScore)}\n\nPracticed ${report?.metadata?.questionCount ?? 0} questions on ${fmtDate(report?.createdAt)}.`,
      });
    } catch {
      Alert.alert("Share Failed", "Unable to open the share sheet.");
    }
  }, [reportId, shareResultsMutation, avgScore, report]);

  // ── Guard: missing reportId ─────────────────────────────────────────────────

  if (!reportId) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Report ID Missing</Text>
          <Text style={styles.errorSub}>Navigate here via router.push with a reportId param.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading report…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (isError || !report) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.centered}>
          <MaterialCommunityIcons name="wifi-off" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to Load Report</Text>
          <Text style={styles.errorSub}>Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  const overallColor = scoreColor(avgScore);
  const overallBg = scoreBg(avgScore);
  const perfLabel = performanceLabel(avgScore);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Full Interview Report</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── TEMP DEBUG: raw API response ── */}
        {!!report && (
          <View
            style={{
              backgroundColor: "#F0FFF4",
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: "#A7F3D0",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#065F46", marginBottom: 4 }}>
              DEBUG — RAW API DATA
            </Text>
            <Text style={{ fontSize: 10, color: "#064E3B", fontFamily: "monospace" }} selectable>
              {JSON.stringify(report, null, 2)}
            </Text>
          </View>
        )}

        {/* ── OVERALL SCORE ── */}
        <View style={[styles.card, styles.scoreCard]}>
          <View style={[styles.scoreRing, { borderColor: overallColor }]}>
            <Text style={[styles.scoreNumber, { color: overallColor }]}>{avgScore}</Text>
            <Text style={styles.scoreOutOf}>/ 100</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.perfLabel, { color: overallColor }]}>{perfLabel}</Text>
            <Text style={styles.perfSub}>Overall performance score</Text>
            {/* Category score chips */}
            {report.scores?.length > 0 && (
              <View style={styles.categoryRow}>
                {report.scores.map((cs) => {
                  const icon = trendIcon(cs.trend);
                  return (
                    <View key={cs.category} style={styles.categoryChip}>
                      <Text style={styles.categoryChipLabel}>{cs.category}</Text>
                      <Text style={[styles.categoryChipScore, { color: scoreColor(cs.score) }]}>
                        {cs.score}
                      </Text>
                      <MaterialCommunityIcons name={icon.name} size={12} color={icon.color} />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* ── INTERVIEW DETAILS ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>INTERVIEW DETAILS</Text>
          <DetailRow label="Type" value={capitalize(report.metadata?.interviewType)} />
          <View style={styles.divider} />
          <DetailRow label="Date" value={fmtDate(report.createdAt)} />
          <View style={styles.divider} />
          <DetailRow label="Duration" value={fmtDuration(report.metadata?.duration)} />
          <View style={styles.divider} />
          <DetailRow
            label="Questions"
            value={String(report.metadata?.questionCount ?? report.questions.length)}
          />
        </View>

        {/* ── AI SUMMARY ── */}
        {!!report.aiSummary && (
          <View style={[styles.card, styles.aiCard]}>
            <View style={styles.aiHeader}>
              <MaterialCommunityIcons name="robot-outline" size={18} color="#2563EB" />
              <Text style={styles.aiTitle}>AI Summary</Text>
            </View>
            <Text style={styles.aiBody}>{report.aiSummary}</Text>
          </View>
        )}

        {/* ── QUESTION-BY-QUESTION ── */}
        {report.questions?.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>QUESTION BREAKDOWN</Text>
            <Text style={styles.sectionHint}>Tap a question to expand details</Text>
            {report.questions.map((q, i) => (
              <ExpandableQuestion key={q.questionId || i} index={i + 1} item={q} />
            ))}
          </View>
        )}

        {/* ── CATEGORY SCORES ── */}
        {report.scores?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>CATEGORY SCORES</Text>
            {report.scores.map((cs) => (
              <ScoreBar key={cs.category} label={cs.category} score={cs.score} />
            ))}
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

        {/* ── ACTION BUTTONS ── */}
        <View style={styles.actionsRow}>
          {/* Download PDF */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionBtnPrimary,
              isDownloading && styles.actionBtnDisabled,
            ]}
            onPress={handleDownloadPdf}
            disabled={isDownloading}
            activeOpacity={0.85}
          >
            {isDownloading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnTextWhite}>Download PDF</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Share Results */}
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
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  android: { elevation: 3 },
  default: {},
});

const styles = StyleSheet.create({
  // ── Shell ──────────────────────────────────────────────────────────────────
  safe: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    textAlign: "center",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Card base ──────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    ...SHADOW,
  },

  // ── Score card ─────────────────────────────────────────────────────────────
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scoreRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },
  scoreOutOf: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  perfLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  perfSub: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryChipLabel: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  categoryChipScore: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Section labels ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  sectionHint: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: -10,
    marginBottom: 12,
  },

  // ── Detail rows ────────────────────────────────────────────────────────────
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  // ── AI Summary ─────────────────────────────────────────────────────────────
  aiCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  aiBody: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 22,
  },

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
  qIndexText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
  },
  qText: {
    flex: 1,
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "500",
    lineHeight: 18,
  },
  qScoreBadge: {
    minWidth: 38,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  qScoreText: {
    fontSize: 13,
    fontWeight: "700",
  },
  qBody: {
    // maxHeight animated externally
  },
  qBodyInner: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
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
  qAnswerText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
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
  qFeedbackText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  qDuration: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "right",
  },

  // ── Score bar ──────────────────────────────────────────────────────────────
  scoreBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  scoreBarLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    width: 110,
  },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 6,
    borderRadius: 3,
  },
  scoreBarValue: {
    fontSize: 13,
    fontWeight: "700",
    width: 32,
    textAlign: "right",
  },

  // ── Next steps ─────────────────────────────────────────────────────────────
  nextStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  nextStepDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2563EB",
    marginTop: 6,
    flexShrink: 0,
  },
  nextStepText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },

  // ── Action buttons ─────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
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
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  actionBtnSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnTextWhite: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  actionBtnTextBlue: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },

  // ── Loading / error states ─────────────────────────────────────────────────
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#64748B",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  errorSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
