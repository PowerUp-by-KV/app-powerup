import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";

import type { ActivityQuestion } from "@powerup/shared";

import { useSubmitWritingAnswerMutation } from "@/services/module-api";
import type { WritingResultRead } from "@/services/module-api";

export interface WritingActivityResult {
  passed: boolean;
  score: number;
}

interface WritingActivityProps {
  activityId: string;
  questions: ActivityQuestion[];
  onComplete: (result: WritingActivityResult) => void;
}

export function WritingActivity({ questions, onComplete }: WritingActivityProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const prompt = questions[0];
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreView, setScoreView] = useState<WritingResultRead | null>(null);

  const [submitWriting] = useSubmitWritingAnswerMutation();

  const handleSubmit = async () => {
    if (text.trim().length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitWriting({
        question_id: prompt?.id ?? "",
        response_text: text.trim(),
      }).unwrap();
      setScoreView(res);
    } catch {
      setError("Submission failed. Tap retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (scoreView) {
    return (
      <ScrollView
        style={{
          flex: 1,
          ...Platform.select({ web: { userSelect: "none" } as Record<string, unknown> }),
        }}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      >
        <Text className="text-slate-900 dark:text-white text-xl font-bold mb-2">
          Your writing score
        </Text>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "800",
            color: scoreView.passed ? "#16a34a" : "#dc2626",
          }}
        >
          {Math.round(scoreView.score)}
        </Text>
        <Text className="text-slate-500 dark:text-zinc-400 mb-2">
          {scoreView.passed ? "Nicely written." : "Try once more — aim for clearer structure."}
        </Text>
        <Text style={{ color: isDark ? "#cbd5e1" : "#475569", marginBottom: 12 }}>
          {scoreView.feedback}
        </Text>
        {scoreView.grammar_errors.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{ color: isDark ? "#e2e8f0" : "#334155", fontWeight: "600", marginBottom: 6 }}
            >
              Grammar notes
            </Text>
            {scoreView.grammar_errors.map((err, i) => (
              <Text key={i} style={{ color: isDark ? "#cbd5e1" : "#64748b", marginBottom: 4 }}>
                • {err}
              </Text>
            ))}
          </View>
        )}
        <TouchableOpacity
          onPress={() => onComplete({ passed: scoreView.passed, score: scoreView.score })}
          activeOpacity={0.8}
          style={{
            marginTop: 20,
            backgroundColor: "#3b82f6", // Primary blue color
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            ...Platform.select({ web: { cursor: "pointer" } as Record<string, unknown> }),
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{
          flex: 1,
          ...Platform.select({ web: { userSelect: "none" } as Record<string, unknown> }),
        }}
        contentContainerStyle={{ padding: 24, paddingBottom: 64, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
          Writing
        </Text>
        <Text className="text-base text-gray-800 dark:text-white leading-relaxed mb-4">
          {prompt?.question_text ?? ""}
        </Text>

        <TextInput
          multiline
          textAlignVertical="top"
          placeholder="Write your answer here…"
          placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
          value={text}
          onChangeText={setText}
          style={{
            minHeight: 180,
            padding: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: isDark ? "#2d2d3a" : "#e5e7eb",
            backgroundColor: isDark ? "#1E1F2A" : "#ffffff",
            fontSize: 15,
            color: isDark ? "#f8fafc" : "#0f172a",
          }}
        />
        <Text style={{ marginTop: 6, color: isDark ? "#71717a" : "#94a3b8", fontSize: 12 }}>
          {text.trim().split(/\s+/).filter(Boolean).length} words
        </Text>

        {error ? (
          <Text style={{ marginTop: 12, color: "#dc2626", textAlign: "center" }}>{error}</Text>
        ) : null}

        <View style={{ marginTop: 32, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || text.trim().length === 0}
            activeOpacity={0.85}
            style={{
              backgroundColor:
                submitting || text.trim().length === 0
                  ? isDark
                    ? "#2E3048" // Distinct contrasting dark color (lighter than background #151620)
                    : "#E2E8F0" // Distinct light grey
                  : "#3b82f6", // Match standard activity blue color!
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: submitting || text.trim().length === 0 ? 0 : 0.25,
              shadowRadius: 8,
              elevation: submitting || text.trim().length === 0 ? 0 : 4,
              ...Platform.select({
                web: {
                  cursor: submitting || text.trim().length === 0 ? "default" : "pointer",
                } as Record<string, unknown>,
              }),
            }}
          >
            {submitting ? (
              <ActivityIndicator color={isDark ? "#ffffff" : "#475569"} />
            ) : (
              <Text
                style={{
                  color:
                    submitting || text.trim().length === 0
                      ? isDark
                        ? "#71717A" // Readable grey on dark button background
                        : "#A0AEC0" // Readable grey on light button background
                      : "#ffffff", // High-contrast white for active state
                  fontWeight: "800",
                  fontSize: 16,
                  letterSpacing: 0.5,
                }}
              >
                Submit
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
