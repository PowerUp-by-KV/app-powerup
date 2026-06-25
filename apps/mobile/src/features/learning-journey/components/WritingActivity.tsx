import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
        <Pressable
          onPress={() => onComplete({ passed: scoreView.passed, score: scoreView.score })}
          style={({ pressed }) => ({
            marginTop: 8,
            backgroundColor: pressed ? "#2563eb" : "#3b82f6",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
            ...Platform.select({ web: { cursor: "pointer" } as Record<string, unknown> }),
          })}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
        </Pressable>
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
        contentContainerStyle={{ padding: 24, paddingBottom: 24 }}
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
      </ScrollView>

      {/* Docked Submit Button Container */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 20 : 24,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2d2d3a" : "#f1f5f9",
          backgroundColor: isDark ? "#151620" : "#ffffff",
        }}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={submitting || text.trim().length === 0}
          style={({ pressed }) => ({
            backgroundColor:
              submitting || text.trim().length === 0
                ? isDark
                  ? "#27272a"
                  : "#cbd5e1"
                : pressed
                  ? "#2563eb"
                  : "#3b82f6",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
            ...Platform.select({
              web: {
                cursor: submitting || text.trim().length === 0 ? "default" : "pointer",
              } as Record<string, unknown>,
            }),
          })}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color:
                  submitting || text.trim().length === 0 ? (isDark ? "#52525b" : "#fff") : "#fff",
                fontWeight: "700",
              }}
            >
              Submit
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
