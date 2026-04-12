/**
 * src/features/interview/screens/SummaryScreen.tsx
 *
 * Full interview results screen shown after all questions are answered.
 * Reads questions, answers, scores from router params.
 */

import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack, router as rootRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { ScoreIndicator, ScoreProgressBar } from "../components/ScoreIndicator";
import type { InterviewQuestion, InterviewAnswer, QuestionScore } from "../types/interview.types";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const PERFORMANCE_CONFIG: Record<
  "Excellent" | "Good" | "Needs Improvement",
  { emoji: string; color: string; bg: string; message: string }
> = {
  Excellent: {
    emoji: "🏆",
    color: "#15803D",
    bg: "#DCFCE7",
    message: "Impressive performance! You demonstrated strong communication, clarity, and depth.",
  },
  Good: {
    emoji: "👍",
    color: "#92400E",
    bg: "#FEF3C7",
    message: "Solid effort! With a bit more detail and structure your answers will really shine.",
  },
  "Needs Improvement": {
    emoji: "📈",
    color: "#991B1B",
    bg: "#FEE2E2",
    message: "Keep practising! Focus on the STAR method and use specific, real-world examples.",
  },
};

export function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();

  // Parse params from router
  const questions: InterviewQuestion[] = params.questions ? JSON.parse(params.questions) : [];
  const answers: InterviewAnswer[] = params.answers ? JSON.parse(params.answers) : [];
  const scores: QuestionScore[] = params.scores ? JSON.parse(params.scores) : [];

  const startTimeMs = params.startTimeMs ? parseInt(params.startTimeMs, 10) : 0;
  const endTimeMs = params.endTimeMs ? parseInt(params.endTimeMs, 10) : 0;

  // Calculate stats
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxPossibleScore = questions.length * 10;
  const averageScore = scores.length > 0 ? Math.round((totalScore / scores.length) * 10) / 10 : 0;
  const durationSeconds =
    endTimeMs && startTimeMs ? Math.round((endTimeMs - startTimeMs) / 1000) : 0;

  let performanceLabel: "Excellent" | "Good" | "Needs Improvement" = "Needs Improvement";
  if (averageScore >= 8) performanceLabel = "Excellent";
  else if (averageScore >= 5) performanceLabel = "Good";

  const perf = PERFORMANCE_CONFIG[performanceLabel];

  const handleTryAgain = () => {
    router.replace("/interview/question");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  // Guard: if no data, show error
  if (questions.length === 0 || scores.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>No interview data found</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoHome}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>← Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      {/* Header back button → Session Picker (arrived via replace, so no native back) */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => rootRouter.push("/interview/coach" as never)}
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1D4ED8" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Performance header */}
          <View style={[styles.heroCard, { backgroundColor: perf.bg }]}>
            <Text style={styles.heroEmoji}>{perf.emoji}</Text>
            <Text style={[styles.heroLabel, { color: perf.color }]}>{performanceLabel}</Text>
            <Text style={[styles.heroMessage, { color: perf.color }]}>{perf.message}</Text>

            <View style={styles.heroScoreRow}>
              <ScoreIndicator
                score={parseFloat(averageScore.toFixed(1))}
                maxScore={10}
                size={88}
                label="Avg Score"
              />
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard
              icon="📋"
              value={`${scores.length}`}
              label="Questions"
              sub={`of ${questions.length}`}
            />
            <StatCard
              icon="⭐"
              value={`${totalScore}`}
              label="Total Score"
              sub={`/ ${maxPossibleScore}`}
            />
            <StatCard icon="⏱️" value={formatDuration(durationSeconds)} label="Duration" />
          </View>

          {/* Per-question breakdown */}
          <Text style={styles.sectionTitle}>Question Breakdown</Text>

          {questions.map((question, idx) => {
            const answer = answers.find((a) => a.questionId === question.id);
            const scoreEntry = scores.find((s) => s.questionId === question.id);

            const score = scoreEntry?.score ?? 0;
            const answerText = answer?.text ?? "Not answered";
            const durationSecs = answer?.durationSeconds ?? 0;

            return (
              <View key={question.id} style={styles.breakdownCard}>
                <View style={styles.breakdownHeader}>
                  <View style={styles.questionIndexBadge}>
                    <Text style={styles.questionIndexText}>Q{idx + 1}</Text>
                  </View>
                  <View style={styles.breakdownCategoryBadge}>
                    <Text style={styles.breakdownCategoryText}>{question.category}</Text>
                  </View>
                  {durationSecs > 0 && (
                    <Text style={styles.questionDuration}>⏱ {formatDuration(durationSecs)}</Text>
                  )}
                </View>

                <Text style={styles.breakdownQuestion}>{question.text}</Text>

                <View style={styles.answerBox}>
                  <Text style={styles.answerBoxLabel}>Your Answer</Text>
                  <Text style={styles.answerBoxText} numberOfLines={4} ellipsizeMode="tail">
                    {answerText}
                  </Text>
                </View>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreRowLabel}>Score</Text>
                  <View style={styles.scoreRowRight}>
                    <ScoreProgressBar score={score} maxScore={10} height={10} />
                    <Text style={styles.scoreValueText}>{score} / 10</Text>
                  </View>
                </View>

                {scoreEntry?.feedback ? (
                  <View style={styles.feedbackBox}>
                    <Text style={styles.feedbackText}>💬 {scoreEntry.feedback}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {/* Action buttons */}
          {/* View Full Report button is intentionally absent here.
            SummaryScreen is the standalone offline Interview Coach flow.
            It does not create a backend session and therefore has no real reportId.
            The button will appear in MockInterviewResultScreen where a real sessionId
            (= reportId) is returned by the backend. */}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTryAgain}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>🔄 Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>← Go Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  sub?: string;
}

function StatCard({ icon, value, label, sub }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  heroScoreRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  statSub: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  questionIndexBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  questionIndexText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  breakdownCategoryBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  breakdownCategoryText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  questionDuration: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#9CA3AF",
  },
  breakdownQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
    lineHeight: 21,
  },
  answerBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  answerBoxLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  answerBoxText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 19,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  scoreRowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    width: 44,
  },
  scoreRowRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    width: 36,
    textAlign: "right",
  },
  feedbackBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 10,
  },
  feedbackText: {
    fontSize: 12,
    color: "#1D4ED8",
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#2563EB",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 20,
  },
  // DEBUG — remove once routing confirmed
  debugBanner: {
    backgroundColor: "#BEF264",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#65A30D",
  },
  debugBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A2E05",
    textAlign: "center",
  },
});
