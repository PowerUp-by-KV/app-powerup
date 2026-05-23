/**
 * ResponseCard Component - Displays a single Q&A response in the detail view
 * Shows question text, user answer, optional audio indicator, AI feedback, and score
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import type { PracticeResponse } from "@/services/interview-api";

interface ResponseCardProps {
  response: PracticeResponse;
  index: number;
}

export function ResponseCard({ response, index }: ResponseCardProps) {
  return (
    <View style={styles.card}>
      {/* Question Number Badge */}
      <View style={styles.questionHeader}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>Q{index + 1}</Text>
        </View>
        {response.score !== undefined && response.score !== null && (
          <View style={styles.scoreBadge}>
            <MaterialIcons name="star" size={14} color="#f59e0b" />
            <Text style={styles.scoreText}>{response.score}</Text>
          </View>
        )}
      </View>

      {/* Question */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Question</Text>
        <Text style={styles.questionText}>{response.question_text}</Text>
      </View>

      {/* User Answer */}
      <View style={styles.section}>
        <View style={styles.answerLabelRow}>
          <Text style={styles.sectionLabel}>Your Answer</Text>
          {response.audio_url && (
            <View style={styles.audioBadge}>
              <MaterialIcons name="mic" size={14} color="#7c3aed" />
              <Text style={styles.audioText}>Audio</Text>
            </View>
          )}
        </View>
        <View style={styles.answerBox}>
          <Text style={styles.answerText}>{response.user_answer}</Text>
        </View>
      </View>

      {/* AI Feedback */}
      {response.ai_feedback && (
        <View style={styles.section}>
          <View style={styles.feedbackLabelRow}>
            <MaterialIcons name="smart-toy" size={16} color="#2563eb" />
            <Text style={styles.feedbackLabel}>AI Feedback</Text>
          </View>
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{response.ai_feedback}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  numberBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  numberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fffbeb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b45309",
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    lineHeight: 22,
  },
  answerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  audioBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f5f3ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  audioText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7c3aed",
  },
  answerBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  answerText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  feedbackLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  feedbackBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  feedbackText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
});
