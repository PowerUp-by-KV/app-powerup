import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Feather } from "@expo/vector-icons";
import type { Activity, ActivityQuestion } from "@powerup/shared";

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
  activity?: Activity;
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

// Helper to check if an option matches the correct answer
function isMatch(opt: { id: string; text: string }, index: number, correctAnswer: string): boolean {
  const optId = opt.id.trim().toUpperCase();
  const optText = opt.text.trim().toLowerCase();
  const ans = correctAnswer.trim();
  const ansUpper = ans.toUpperCase();
  const ansLower = ans.toLowerCase();

  // 1. Direct match on Option ID or Option Text
  if (optId === ansUpper) return true;
  if (optText === ansLower) return true;

  const letter = String.fromCharCode(65 + index); // "A", "B", etc.
  if (ansUpper === letter) return true;

  // 2. Prefix matches (e.g. correct_answer is "B: text" or option starts with letter)
  if (
    ansUpper.startsWith(`${letter}:`) ||
    ansUpper.startsWith(`${letter}.`) ||
    ansUpper.startsWith(`${letter} `)
  ) {
    // If the correct answer is prefixed with the letter, check if the remaining text matches the option text
    for (const sep of [":", ".", " "]) {
      if (ansUpper.startsWith(`${letter}${sep}`)) {
        const remaining = ans.substring(2).trim().toLowerCase();
        if (remaining === optText || remaining === optId.toLowerCase()) return true;
      }
    }
    return true;
  }

  // 3. Substring match for cases like "A, B, C, D" matching option A's text "A, B, C, D"
  if (ansLower.includes(optText) && optText.length > 2) return true;

  return false;
}

/**
 * Reading / vocabulary / grammar MCQ renderer — 4 option cards, submit, result.
 * Builds an aggregate pass/fail across the question set when the user finishes.
 */
export function McqActivity({
  activity,
  questions,
  onComplete,
  isNested = false,
}: McqActivityProps) {
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

  const passageText = useMemo(() => {
    if (passage?.question_text) {
      return passage.question_text;
    }

    const val = activity?.content;
    if (val && typeof val === "object") {
      if (val.text) return String(val.text).trim();
      if (val.name) return String(val.name).trim();
      if (val.description) return String(val.description).trim();
    } else if (val) {
      const str = String(val).trim();
      if (str !== "{}" && str !== "[]") return str;
    }

    const rawAct = activity as Record<string, unknown> | undefined;
    if (rawAct && typeof rawAct.description === "string") {
      return rawAct.description.trim();
    }

    return null;
  }, [passage, activity]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    correctAnswer: string;
    totalCorrect: number;
  } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [scoreView, setScoreView] = useState<{
    score: number;
    passed: boolean;
    totalCorrect: number;
  } | null>(null);

  const current = mcqs[idx]!;

  const parsedQuestion = useMemo(() => {
    const rawText = current?.question_text ?? "";
    const text = rawText.replace(/^\d+[\.\)\:\s-]+\s*/, "");
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

  if (mcqs.length === 0) {
    return (
      <View style={{ padding: 24, alignItems: "center" }}>
        <Text
          style={{ color: isDark ? "#cbd5e1" : "#475569", textAlign: "center", marginBottom: 20 }}
        >
          No questions available for this activity.
        </Text>
        <Pressable
          onPress={() => onComplete({ passed: true, score: 100 })}
          style={{
            width: "100%",
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

    const nextCorrectCount = correct ? correctCount + 1 : correctCount;
    if (correct) setCorrectCount(nextCorrectCount);

    const correctLetter =
      correctIndex !== -1 ? String.fromCharCode(65 + correctIndex) : correctAnswerStr;

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
    const totalCorrect = result.totalCorrect;
    const score = Math.round((totalCorrect / mcqs.length) * 100);
    onComplete({ passed: score >= 70, score });
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

    const scoreColor = scoreView.passed
      ? isDark
        ? "#22c55e"
        : "#15803d"
      : isDark
        ? "#ef4444"
        : "#b91c1c";

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
                  ? "#14532d"
                  : "#dcfce7"
                : isDark
                  ? "#7f1d1d"
                  : "#fee2e2",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Feather
              name={scoreView.passed ? "check-circle" : "alert-circle"}
              size={40}
              color={scoreColor}
            />
          </View>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">
            Activity Score
          </Text>
          <Text
            style={{
              fontSize: 64,
              fontWeight: "900",
              color: scoreColor,
              lineHeight: 72,
            }}
          >
            {scoreView.score}%
          </Text>
          <Text className="text-slate-900 dark:text-slate-100 text-xl font-bold mt-4 text-center">
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
        {passageText ? (
          <View
            style={{
              backgroundColor: isDark ? "#1e1f2a" : "#f8fafc",
              borderWidth: 1,
              borderColor: isDark ? "#2d2d3a" : "#e2e8f0",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Feather name="book-open" size={16} color="#6366f1" />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#4f46e5",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginLeft: 8,
                }}
              >
                Reading Passage
              </Text>
            </View>
            <Text style={{ color: isDark ? "#cbd5e1" : "#334155", fontSize: 14, lineHeight: 22 }}>
              {passageText}
            </Text>
          </View>
        ) : null}

        <Text className="text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-2">
          Question {idx + 1} of {mcqs.length}
        </Text>
        {parsedQuestion.isParsed ? (
          <View style={{ marginBottom: 24 }}>
            {/* The Target Sentence Card */}
            <View
              style={{
                backgroundColor: isDark ? "#231e3d" : "#f5f3ff",
                borderWidth: 1,
                borderColor: isDark ? "#3f2d59" : "#ddd6fe",
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
                  color: isDark ? "#c084fc" : "#4c1d95",
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
          <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-6">
            {parsedQuestion.questionPrompt.charAt(0).toUpperCase() +
              parsedQuestion.questionPrompt.slice(1)}
          </Text>
        )}

        {options.map((opt, i) => {
          const isSelected = selected === opt.id;
          const hasSubmitted = lastResult !== null;

          let borderColor = isDark ? "#2d2d3a" : "#e5e7eb";
          let backgroundColor = isDark ? "#1e1f2a" : "#ffffff";
          let dotBorderColor = isDark ? "#4b5563" : "#cbd5e1";
          let dotTextColor = isDark ? "#a1a1aa" : "#64748b";
          let feedbackIcon = null;

          if (hasSubmitted) {
            const correctAnswerStr = current.correct_answer ?? "";
            const isCorrectAnswer = isMatch(opt, i, correctAnswerStr);
            if (isCorrectAnswer) {
              borderColor = "#22c55e"; // Green border
              backgroundColor = isDark ? "#14532d" : "#f0fdf4"; // Light green bg
              dotBorderColor = "#22c55e";
              dotTextColor = "#22c55e";
              feedbackIcon = <Feather name="check-circle" size={20} color="#22c55e" />;
            } else if (isSelected) {
              borderColor = "#ef4444"; // Red border
              backgroundColor = isDark ? "#7f1d1d" : "#fef2f2"; // Light red bg
              dotBorderColor = "#ef4444";
              dotTextColor = "#ef4444";
              feedbackIcon = <Feather name="x-circle" size={20} color="#ef4444" />;
            }
          } else if (isSelected) {
            borderColor = "#3b82f6"; // Blue border
            backgroundColor = isDark ? "#1e3a8a" : "#eff6ff"; // Light blue bg
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
              <Text style={{ flex: 1, color: isDark ? "#ffffff" : "#0f172a", fontSize: 15 }}>
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
                  backgroundColor:
                    selected === null
                      ? isDark
                        ? "#2d2d3a"
                        : "#cbd5e1"
                      : pressed
                        ? "#2563eb"
                        : "#3b82f6",
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: selected === null ? (isDark ? "#4b5563" : "#fff") : "#fff",
                    fontWeight: "700",
                  }}
                >
                  Submit
                </Text>
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
      />
    </View>
  );
}
