import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import type { ActivityQuestion } from "@powerup/shared";

import { useColorScheme } from "nativewind";

import { AnswerResultSheet } from "./AnswerResultSheet";
import { SpeedMatchingGame } from "./SpeedMatchingGame";

export interface McqActivityResult {
  /** Whether the user passed the activity overall (≥ 70% correct). */
  passed: boolean;
  /** Percentage correct (0–100). */
  score: number;
}

export const MCQ_PASS_THRESHOLD = 70;

/**
 * Score an activity from a per-question correctness map.
 *
 * Keying by question index is what makes the count idempotent: answering the same question
 * twice overwrites its entry instead of adding to a running total. A running total is what
 * produced "You answered 4 of 3 questions correctly" (133%) — and that score was sent to
 * the server as the real one.
 */
export function scoreMcqActivity(
  correctByIndex: Record<number, boolean>,
  questionCount: number,
): { score: number; passed: boolean; totalCorrect: number } {
  const totalCorrect = Math.min(
    Object.values(correctByIndex).filter(Boolean).length,
    questionCount,
  );
  const score =
    questionCount > 0 ? Math.min(100, Math.round((totalCorrect / questionCount) * 100)) : 0;

  return { score, passed: score >= MCQ_PASS_THRESHOLD, totalCorrect };
}

interface McqActivityProps {
  /** Questions to ask in order. Non-MCQ entries are filtered out. */
  questions: ActivityQuestion[];
  /** Called once when the last question's result sheet is dismissed. */
  onComplete: (result: McqActivityResult) => void;
  /** Whether the MCQ component is nested inside a parent ScrollView. */
  isNested?: boolean;
}

function asOption(opt: unknown): { id: string; text: string } {
  if (typeof opt === "string") return { id: opt, text: opt };
  const o = opt as { id?: string; text?: string };
  return { id: o.id ?? o.text ?? "", text: o.text ?? o.id ?? "" };
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/→/g, "->").replace(/\s+/g, " ").trim();
}

// Helper to check if an option matches the correct answer
function isMatch(opt: { id: string; text: string }, index: number, correctAnswer: string): boolean {
  const optId = normalize(opt.id);
  const optText = normalize(opt.text);
  const ans = normalize(correctAnswer);

  if (optId === ans || optText === ans) return true;

  const letter = String.fromCharCode(65 + index).toLowerCase();
  if (ans === letter) return true;

  // Check if answer starts with letter prefix (e.g. "c: ...", "c. ...", "c) ...")
  const prefixes = [`${letter}:`, `${letter}.`, `${letter})`];
  for (const prefix of prefixes) {
    if (ans.startsWith(prefix)) {
      const remaining = ans.substring(prefix.length).trim();
      if (remaining === optId || remaining === optText) return true;
    }
  }

  return false;
}

/**
 * Reading / vocabulary / grammar MCQ renderer — 4 option cards, submit, result.
 * Builds an aggregate pass/fail across the question set when the user finishes.
 */
export function McqActivity({ questions, onComplete, isNested = false }: McqActivityProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const isSpeedMatching = useMemo(
    () => questions.some((q) => q.question_type === "speed_matching"),
    [questions],
  );

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

  const passage = useMemo(() => questions.find((q) => q.question_type === "passage"), [questions]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    correctAnswer: string;
    totalCorrect: number;
  } | null>(null);
  // Keyed by question index, not a running total. A running count double-counted: dismissing
  // the result sheet re-enables the options without clearing `selected` or rolling the count
  // back, so re-answering the same question incremented it again — 3 questions could score
  // "4 of 3 correct" (133%), and that score was then POSTed to the server as real.
  const [correctByIndex, setCorrectByIndex] = useState<Record<number, boolean>>({});
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState("");
  const [scoreView, setScoreView] = useState<{
    score: number;
    passed: boolean;
    totalCorrect: number;
  } | null>(null);

  // ActivityRenderer reuses this component without a key, and ModuleScreen swaps activities
  // in place — so without this, a new activity would inherit the previous one's answers.
  useEffect(() => {
    setIdx(0);
    setSelected(null);
    setLastResult(null);
    setCorrectByIndex({});
    setScoreView(null);
  }, [mcqs]);

  const current = mcqs[idx];

  const parsedQuestion = useMemo(() => {
    const text = current?.question_text ?? "";
    const parts = text.split("—");
    if (parts.length >= 3) {
      const sentenceLabel = parts[0]?.trim() ?? "";
      const sentenceText = (parts[1]?.trim() ?? "").replace(/^['"‘“]|['"’”]$/g, "");
      const questionPrompt = parts.slice(2).join("—").trim();
      return {
        sentenceLabel,
        sentenceText,
        questionPrompt,
        isParsed: true,
      };
    }
    const quoteRegex = /['"‘“]([^'"’”]{10,})['"’”]/;
    const match = text.match(quoteRegex);
    if (match) {
      const sentenceText = match[1]?.trim() ?? "";
      const questionPrompt = text.replace(match[0], "_____").trim();
      return {
        sentenceLabel: "Target Sentence",
        sentenceText,
        questionPrompt,
        isParsed: true,
      };
    }
    return {
      sentenceLabel: "",
      sentenceText: "",
      questionPrompt: text,
      isParsed: false,
    };
  }, [current]);

  if (isSpeedMatching) {
    return <SpeedMatchingGame questions={questions} onComplete={onComplete} />;
  }

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

    const correctAnswerStr = current.correct_answer ?? "";
    const correctIndex = options.findIndex((opt, i) => isMatch(opt, i, correctAnswerStr));

    const selectedIndex = options.findIndex((opt) => opt.id === selected);
    const correct = selectedIndex !== -1 && selectedIndex === correctIndex;

    // Record against this question, so re-answering it overwrites rather than adds.
    const nextCorrectByIndex = { ...correctByIndex, [idx]: correct };
    setCorrectByIndex(nextCorrectByIndex);
    const nextCorrectCount = Object.values(nextCorrectByIndex).filter(Boolean).length;

    const correctLetter =
      correctIndex !== -1
        ? `${String.fromCharCode(65 + correctIndex)}: ${options[correctIndex]?.text}`
        : correctAnswerStr;

    setLastCorrect(correct);
    setLastCorrectAnswer(correctLetter);

    setLastResult({
      correct,
      correctAnswer: correctLetter,
      totalCorrect: nextCorrectCount,
    });
  };

  const handleContinue = () => {
    const result = lastResult;
    if (!result) return;

    setLastResult(null);
    setSelected(null);
    if (idx + 1 < mcqs.length) {
      setIdx(idx + 1);
      return;
    }
    setScoreView(scoreMcqActivity(correctByIndex, mcqs.length));
  };

  if (scoreView) {
    const ScoreWrapper = isNested ? View : ScrollView;
    const scoreWrapperProps = isNested
      ? { style: { padding: 24, paddingBottom: 120 } }
      : {
          style: [
            { flex: 1 },
            Platform.OS === "web" && ({ userSelect: "none" } as Record<string, unknown>),
          ],
          contentContainerStyle: { padding: 24, paddingBottom: 120 },
        };

    return (
      <ScoreWrapper {...scoreWrapperProps}>
        <View style={{ alignItems: "center", marginVertical: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: scoreView.passed
                ? isDark
                  ? "rgba(34, 197, 94, 0.2)"
                  : "#dcfce7"
                : isDark
                  ? "rgba(239, 68, 68, 0.2)"
                  : "#fee2e2",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Feather
              name={scoreView.passed ? "check-circle" : "alert-circle"}
              size={40}
              color={
                scoreView.passed ? (isDark ? "#22c55e" : "#15803d") : isDark ? "#f87171" : "#b91c1c"
              }
            />
          </View>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">
            Activity Score
          </Text>
          <Text
            style={{
              fontSize: 64,
              fontWeight: "900",
              color: scoreView.passed
                ? isDark
                  ? "#22c55e"
                  : "#15803d"
                : isDark
                  ? "#f87171"
                  : "#b91c1c",
              lineHeight: 72,
            }}
          >
            {scoreView.score}%
          </Text>
          <Text className="text-slate-900 dark:text-white text-xl font-bold mt-4 text-center">
            {scoreView.passed ? "Nicely done!" : "Keep practicing!"}
          </Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-sm mt-2 text-center">
            {scoreView.passed
              ? `You answered ${scoreView.totalCorrect} of ${mcqs.length} questions correctly.`
              : `You got ${scoreView.totalCorrect} of ${mcqs.length} questions correct. You need 70% to pass.`}
          </Text>
        </View>

        <Pressable
          onPress={() => onComplete({ passed: scoreView.passed, score: scoreView.score })}
          style={{
            marginTop: 24,
            borderRadius: 10,
            ...(Platform.OS === "web" ? ({ cursor: "pointer" } as Record<string, unknown>) : {}),
          }}
        >
          {({ pressed }) => (
            <View
              style={{
                backgroundColor: pressed ? "#2563eb" : "#3b82f6",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
            </View>
          )}
        </Pressable>
      </ScoreWrapper>
    );
  }

  const ContentWrapper = isNested ? View : ScrollView;
  const wrapperStyle = { padding: 24, paddingBottom: 120 };
  const wrapperProps = isNested
    ? { style: wrapperStyle }
    : { style: { flex: 1 }, contentContainerStyle: wrapperStyle };

  return (
    <View
      style={[
        // When nested inside a parent ScrollView (e.g. ListeningActivity), flex:1
        // collapses on Android and clips the Submit button below the fold. Size to
        // content instead so the parent ScrollView can reach the button.
        isNested ? {} : { flex: 1 },
        Platform.OS === "web" && ({ userSelect: "none" } as Record<string, unknown>),
      ]}
    >
      <ContentWrapper {...wrapperProps}>
        {passage?.question_text ? (
          <View
            style={{
              backgroundColor: isDark ? "#1E1F2A" : "#f8fafc",
              borderWidth: 1,
              borderColor: isDark ? "#2d2d3a" : "#e2e8f0",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Feather name="book-open" size={16} color={isDark ? "#3b82f6" : "#6366f1"} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: isDark ? "#60a5fa" : "#4f46e5",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginLeft: 8,
                }}
              >
                Reading Passage
              </Text>
            </View>
            <Text style={{ color: isDark ? "#e2e8f0" : "#334155", fontSize: 14, lineHeight: 22 }}>
              {passage.question_text}
            </Text>
          </View>
        ) : null}

        <Text className="text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
          Question {idx + 1} of {mcqs.length}
        </Text>
        {parsedQuestion.isParsed ? (
          <View style={{ marginBottom: 24 }}>
            {/* The Target Sentence Card */}
            <View
              style={{
                backgroundColor: isDark ? "rgba(91, 33, 182, 0.15)" : "#f5f3ff",
                borderWidth: 1,
                borderColor: isDark ? "#5b21b6" : "#ddd6fe",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <View
                  style={{
                    backgroundColor: "#c084fc",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    {parsedQuestion.sentenceLabel}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  color: isDark ? "#d8b4fe" : "#4c1d95",
                  fontSize: 16,
                  fontWeight: "600",
                  fontStyle: "italic",
                  lineHeight: 24,
                }}
              >
                “{parsedQuestion.sentenceText}”
              </Text>
            </View>

            {/* The Question Prompt */}
            <Text
              style={{
                color: isDark ? "#ffffff" : "#0f172a",
                fontSize: 18,
                fontWeight: "700",
                lineHeight: 26,
              }}
            >
              {parsedQuestion.questionPrompt.charAt(0).toUpperCase() +
                parsedQuestion.questionPrompt.slice(1)}
            </Text>
          </View>
        ) : (
          <Text className="text-base text-gray-800 dark:text-white leading-relaxed mb-6">
            {current.question_text}
          </Text>
        )}

        {options.map((opt, i) => {
          const isSelected = selected === opt.id;
          const hasSubmitted = lastResult !== null;

          let borderColor = isDark ? "#2d2d3a" : "#e5e7eb";
          let backgroundColor = isDark ? "#1E1F2A" : "#ffffff";
          let dotBorderColor = isDark ? "#4b5563" : "#cbd5e1";
          let dotTextColor = isDark ? "#9ca3af" : "#64748b";
          let feedbackIcon = null;

          if (hasSubmitted) {
            const correctAnswerStr = current.correct_answer ?? "";
            const isCorrectAnswer = isMatch(opt, i, correctAnswerStr);
            if (isCorrectAnswer) {
              borderColor = "#22c55e"; // Green border
              backgroundColor = isDark ? "rgba(34, 197, 94, 0.15)" : "#f0fdf4"; // Light green bg
              dotBorderColor = "#22c55e";
              dotTextColor = "#22c55e";
              feedbackIcon = <Feather name="check-circle" size={20} color="#22c55e" />;
            } else if (isSelected) {
              borderColor = "#ef4444"; // Red border
              backgroundColor = isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2"; // Light red bg
              dotBorderColor = "#ef4444";
              dotTextColor = "#ef4444";
              feedbackIcon = <Feather name="x-circle" size={20} color="#ef4444" />;
            }
          } else if (isSelected) {
            borderColor = "#3b82f6"; // Blue border
            backgroundColor = isDark ? "rgba(37, 99, 235, 0.15)" : "#eff6ff"; // Light blue bg
            dotBorderColor = "#3b82f6";
            dotTextColor = "#3b82f6";
            feedbackIcon = <Feather name="check-circle" size={20} color="#3b82f6" />;
          }

          return (
            <Pressable
              key={`${opt.id}-${i}`}
              onPress={() => !hasSubmitted && setSelected(opt.id)}
              disabled={hasSubmitted}
              style={{
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                ...(Platform.OS === "web"
                  ? ({ cursor: "pointer" } as Record<string, unknown>)
                  : {}),
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: dotBorderColor,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: dotTextColor, fontWeight: "700" }}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={{ flex: 1, color: isDark ? "#e2e8f0" : "#0f172a", fontSize: 15 }}>
                {opt.text}
              </Text>
              {feedbackIcon}
            </Pressable>
          );
        })}

        <View style={{ marginTop: 24 }}>
          <Pressable
            onPress={handleSubmit}
            disabled={selected === null}
            style={
              {
                borderRadius: 10,
                ...(Platform.OS === "web"
                  ? ({ cursor: selected === null ? "default" : "pointer" } as Record<
                      string,
                      unknown
                    >)
                  : {}),
              } as Record<string, unknown>
            }
          >
            {({ pressed }) => (
              <View
                style={{
                  backgroundColor: selected === null ? "#cbd5e1" : pressed ? "#2563eb" : "#3b82f6",
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Submit</Text>
              </View>
            )}
          </Pressable>
        </View>
      </ContentWrapper>

      <AnswerResultSheet
        visible={lastResult !== null}
        isCorrect={lastResult !== null ? lastResult.correct : lastCorrect}
        correctSentence={lastResult !== null ? lastResult.correctAnswer : lastCorrectAnswer}
        onContinue={handleContinue}
        onDismiss={() => setLastResult(null)}
      />
    </View>
  );
}
