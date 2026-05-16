import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import type { ActivityQuestion } from "@powerup/shared";

import { AnswerResultSheet } from "./AnswerResultSheet";

export interface McqActivityResult {
  /** Whether the user passed the activity overall (≥ 70% correct). */
  passed: boolean;
  /** Percentage correct (0–100). */
  score: number;
}

interface McqActivityProps {
  /** Questions to ask in order. Non-MCQ entries are filtered out. */
  questions: ActivityQuestion[];
  /** Called once when the last question's result sheet is dismissed. */
  onComplete: (result: McqActivityResult) => void;
}

function asOption(opt: unknown): { id: string; text: string } {
  if (typeof opt === "string") return { id: opt, text: opt };
  const o = opt as { id?: string; text?: string };
  return { id: o.id ?? o.text ?? "", text: o.text ?? o.id ?? "" };
}

/**
 * Reading / vocabulary / grammar MCQ renderer — 4 option cards, submit, result.
 * Builds an aggregate pass/fail across the question set when the user finishes.
 */
export function McqActivity({ questions, onComplete }: McqActivityProps) {
  const mcqs = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.question_type !== "tap_to_build" &&
          Array.isArray(q.options) &&
          q.options.length > 0 &&
          !!q.correct_answer,
      ),
    [questions],
  );

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ correct: boolean; correctAnswer: string } | null>(
    null,
  );
  const [correctCount, setCorrectCount] = useState(0);

  const current = mcqs[idx];

  if (!current) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-slate-500">No MCQ questions available.</Text>
      </View>
    );
  }

  const options = (current.options ?? []).map(asOption);

  const handleSubmit = () => {
    if (selected === null) return;
    const correct = selected.trim() === (current.correct_answer ?? "").trim();
    if (correct) setCorrectCount((c) => c + 1);
    setLastResult({ correct, correctAnswer: current.correct_answer ?? "" });
  };

  const handleContinue = () => {
    setLastResult(null);
    setSelected(null);
    if (idx + 1 < mcqs.length) {
      setIdx(idx + 1);
      return;
    }
    const totalCorrect = correctCount; // already includes the final one
    const score = Math.round((totalCorrect / mcqs.length) * 100);
    onComplete({ passed: score >= 70, score });
  };

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text className="text-xs uppercase tracking-wider text-slate-500 mb-2">
          Question {idx + 1} of {mcqs.length}
        </Text>
        <Text className="text-slate-900 text-lg font-bold mb-6">{current.question_text}</Text>

        {options.map((opt, i) => {
          const isSelected = selected === opt.id;
          return (
            <Pressable
              key={`${opt.id}-${i}`}
              onPress={() => setSelected(opt.id)}
              style={{
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isSelected ? "#2f95dc" : "#e5e7eb",
                backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: isSelected ? "#2f95dc" : "#cbd5e1",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: isSelected ? "#2f95dc" : "#64748b", fontWeight: "700" }}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={{ flex: 1, color: "#0f172a", fontSize: 15 }}>{opt.text}</Text>
              {isSelected ? <Feather name="check-circle" size={20} color="#2f95dc" /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ padding: 24, borderTopWidth: 1, borderTopColor: "#f1f5f9" }}>
        <Pressable
          onPress={handleSubmit}
          disabled={selected === null}
          style={{
            backgroundColor: selected === null ? "#cbd5e1" : "#0f172a",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Submit</Text>
        </Pressable>
      </View>

      <AnswerResultSheet
        visible={lastResult !== null}
        isCorrect={lastResult?.correct ?? false}
        correctSentence={lastResult?.correctAnswer}
        onContinue={handleContinue}
        onDismiss={() => setLastResult(null)}
      />
    </View>
  );
}
