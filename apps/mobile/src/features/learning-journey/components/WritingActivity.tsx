import React, { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

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

export function WritingActivity({ activityId, questions, onComplete }: WritingActivityProps) {
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
          ...Platform.select({ web: { userSelect: "none" } as any }),
        }}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      >
        <Text className="text-slate-900 text-xl font-bold mb-2">Your writing score</Text>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "800",
            color: scoreView.passed ? "#16a34a" : "#dc2626",
          }}
        >
          {Math.round(scoreView.score)}
        </Text>
        <Text className="text-slate-500 mb-2">
          {scoreView.passed ? "Nicely written." : "Try once more — aim for clearer structure."}
        </Text>
        <Text style={{ color: "#475569", marginBottom: 12 }}>{scoreView.feedback}</Text>
        {scoreView.grammar_errors.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#334155", fontWeight: "600", marginBottom: 6 }}>
              Grammar notes
            </Text>
            {scoreView.grammar_errors.map((err, i) => (
              <Text key={i} style={{ color: "#64748b", marginBottom: 4 }}>
                • {err}
              </Text>
            ))}
          </View>
        )}
        <Pressable
          onPress={() => onComplete({ passed: scoreView.passed, score: scoreView.score })}
          style={{
            marginTop: 8,
            backgroundColor: "#0f172a",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
            ...Platform.select({ web: { cursor: "pointer" } as any }),
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        ...Platform.select({ web: { userSelect: "none" } as any }),
      }}
      contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
    >
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
          ...Platform.select({ web: { cursor: submitting || text.trim().length === 0 ? "default" : "pointer" } as any }),
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
