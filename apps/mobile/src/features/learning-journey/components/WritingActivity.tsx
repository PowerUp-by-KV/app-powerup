import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import type { ActivityQuestion } from "@powerup/shared";

import { useSubmitWritingAnswerMutation } from "@/services/module-api";

export interface WritingActivityResult {
  passed: boolean;
  score: number;
}

interface WritingActivityProps {
  activityId: string;
  questions: ActivityQuestion[];
  onComplete: (result: WritingActivityResult) => void;
}

interface Breakdown {
  grammar?: number;
  coherence?: number;
  vocab?: number;
  feedback?: string;
}

/**
 * Prompt + multi-line text input → POST writing/submit → AI feedback.
 * The feedback panel reuses the `score_breakdown` shape the speaking pipeline
 * returns, so the same backend changes light up here too.
 */
export function WritingActivity({ activityId, questions, onComplete }: WritingActivityProps) {
  const prompt = questions[0];
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreView, setScoreView] = useState<{
    score: number;
    passed: boolean;
    breakdown: Breakdown;
  } | null>(null);

  const [submitWriting] = useSubmitWritingAnswerMutation();

  const handleSubmit = async () => {
    if (text.trim().length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitWriting({
        activity_id: activityId,
        answers: [{ question_id: prompt?.id ?? "", answer: text.trim() }],
      }).unwrap();
      const score = Number(res?.score ?? 0);
      const passed = score >= 70;
      const breakdown: Breakdown =
        (res as unknown as { score_breakdown?: Breakdown }).score_breakdown ?? {};
      setScoreView({ score, passed, breakdown });
    } catch {
      setError("Submission failed. Tap retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (scoreView) {
    return (
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text className="text-slate-900 text-xl font-bold mb-2">Your writing score</Text>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "800",
            color: scoreView.passed ? "#16a34a" : "#dc2626",
          }}
        >
          {scoreView.score}
        </Text>
        <Text className="text-slate-500 mb-6">
          {scoreView.passed ? "Nicely written." : "Try once more — aim for clearer structure."}
        </Text>
        {Object.entries(scoreView.breakdown).map(([k, v]) =>
          k === "feedback" ? (
            <Text key={k} style={{ marginTop: 8, color: "#475569" }}>
              {String(v)}
            </Text>
          ) : typeof v === "number" ? (
            <View
              key={k}
              style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}
            >
              <Text style={{ color: "#334155", textTransform: "capitalize" }}>{k}</Text>
              <Text style={{ color: "#0f172a", fontWeight: "600" }}>{v}</Text>
            </View>
          ) : null,
        )}
        <Pressable
          onPress={() => onComplete({ passed: scoreView.passed, score: scoreView.score })}
          style={{
            marginTop: 24,
            backgroundColor: "#0f172a",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
      <Text className="text-xs uppercase tracking-wider text-slate-500 mb-2">Writing</Text>
      <Text className="text-slate-900 text-lg font-bold mb-4">{prompt?.question_text ?? ""}</Text>

      <TextInput
        multiline
        textAlignVertical="top"
        placeholder="Write your answer here…"
        value={text}
        onChangeText={setText}
        style={{
          minHeight: 180,
          padding: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          backgroundColor: "#ffffff",
          fontSize: 15,
          color: "#0f172a",
        }}
      />
      <Text style={{ marginTop: 6, color: "#94a3b8", fontSize: 12 }}>
        {text.trim().split(/\s+/).filter(Boolean).length} words
      </Text>

      <Pressable
        onPress={handleSubmit}
        disabled={submitting || text.trim().length === 0}
        style={{
          marginTop: 24,
          backgroundColor: submitting || text.trim().length === 0 ? "#cbd5e1" : "#0f172a",
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "700" }}>Submit</Text>
        )}
      </Pressable>

      {error ? (
        <Text style={{ marginTop: 12, color: "#dc2626", textAlign: "center" }}>{error}</Text>
      ) : null}
    </ScrollView>
  );
}
