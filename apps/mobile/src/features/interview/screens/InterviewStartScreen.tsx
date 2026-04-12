/**
 * src/features/interview/screens/InterviewStartScreen.tsx
 *
 * Entry point for the standalone Interview Coach flow.
 *
 * - Displays interview overview (question count, estimated duration, tips)
 * - "Start Interview" taps into the QuestionScreen via Expo Router
 * - Accepts an optional `onStart` prop so it can be embedded in other flows
 */

import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getQuestionsForSession } from "../hooks/useInterview";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIPS = [
  { icon: "🎯", text: "Answer clearly and concisely using the STAR method." },
  { icon: "🕐", text: "Take 5–10 seconds to think before answering." },
  { icon: "💡", text: "Use specific examples from real experience." },
  { icon: "🔇", text: "Find a quiet place free from distractions." },
];

// ── Component ─────────────────────────────────────────────────────────────────

const SESSION_SUBTITLES: Record<string, string> = {
  Introduction: "Practise your self-introduction and opening pitch.",
  Projects: "Practice explaining your projects clearly and concisely.",
  Experience: "Practice answers about internships and work experience.",
};

export function InterviewStartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionType?: string; sessionTitle?: string }>();

  const sessionType = params?.sessionType || "";
  const sessionTitle = params?.sessionTitle || "Interview Coach";

  // Use the session-specific question bank (falls back to generic if no sessionType)
  const questions = getQuestionsForSession(sessionType);

  const heroSubtitle =
    SESSION_SUBTITLES[sessionType] ??
    "Practice your interview skills with AI-guided questions and instant feedback.";

  const handleStart = () => {
    // Pass sessionType forward so LiveInterviewScreen loads the right question bank.
    console.log(`🔥 START → Navigating to /interview/question (sessionType=${sessionType})`);
    router.push({
      pathname: "/interview/question" as never,
      params: {
        mode: "standalone",
        questionIndex: "0",
        sessionType,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🎤</Text>
          <Text style={styles.heroTitle}>{sessionTitle}</Text>
          <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBadge value={`${questions.length}`} label="Questions" icon="📋" />
          <StatBadge value="~10 min" label="Duration" icon="⏱️" />
          <StatBadge value="0–10" label="Score / Q" icon="⭐" />
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Before You Begin</Text>
          {TIPS.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        {/* Question previews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Be Asked</Text>
          {questions.map((q, idx) => (
            <View key={q.id} style={styles.previewRow}>
              <View style={styles.previewNumber}>
                <Text style={styles.previewNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.previewText}>{q.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>Start Interview</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

interface StatBadgeProps {
  value: string;
  label: string;
  icon: string;
}

function StatBadge({ value, label, icon }: StatBadgeProps) {
  return (
    <View style={styles.statBadge}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  // Hero
  hero: {
    alignItems: "center",
    marginBottom: 28,
  },
  heroIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  // Stats row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statBadge: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 2,
  },
  // Sections
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  // Tips
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  // Question previews
  previewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  previewNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
    flexShrink: 0,
  },
  previewNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  // CTA
  startButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
