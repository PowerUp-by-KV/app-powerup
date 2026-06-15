/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetInterview, setFinalResult } from "@/store/slices/mock-interview.slice";
import { useGetInterviewResultsQuery } from "@/services/mock-interview-api";
import type { InterviewResultAnswer } from "@/services/mock-interview-api";

// ---------------------------------------------------------------------------
// Sub-component: TrophyIcon
// ---------------------------------------------------------------------------

function TrophyIcon() {
  return (
    <View className="w-20 h-20 rounded-full bg-yellow-50 items-center justify-center mb-4">
      {/* Trophy cup body */}
      <View className="items-center">
        <View
          style={{
            width: 32,
            height: 24,
            backgroundColor: "#F59E0B",
            borderRadius: 4,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        />
        {/* Trophy handles */}
        <View style={{ flexDirection: "row", position: "absolute", top: 4 }}>
          <View
            style={{
              width: 8,
              height: 12,
              borderLeftWidth: 3,
              borderTopWidth: 3,
              borderColor: "#F59E0B",
              borderTopLeftRadius: 4,
              marginLeft: -6,
            }}
          />
          <View style={{ width: 14 }} />
          <View
            style={{
              width: 8,
              height: 12,
              borderRightWidth: 3,
              borderTopWidth: 3,
              borderColor: "#F59E0B",
              borderTopRightRadius: 4,
              marginRight: -6,
            }}
          />
        </View>
        {/* Stand */}
        <View style={{ width: 4, height: 6, backgroundColor: "#F59E0B" }} />
        <View
          style={{
            width: 20,
            height: 4,
            backgroundColor: "#F59E0B",
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ScoreBadge
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number | null }) {
  return (
    <View className="bg-blue-100 rounded-full px-3 py-0.5 mr-3">
      <Text className="text-xs font-semibold text-blue-600">
        {score !== null ? score.toFixed(2) : "—"}/10
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ResponseAccordion
// Expandable row per question — local open/close state is UI-only (justified)
// ---------------------------------------------------------------------------

interface ResponseAccordionProps {
  index: number;
  answer: InterviewResultAnswer;
}

function ResponseAccordion({ index, answer }: ResponseAccordionProps) {
  // Local open state is justified: this is purely presentational accordion UI
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <Pressable
      onPress={toggle}
      className="bg-white rounded-2xl px-4 py-4 mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Row header */}
      <View className="flex-row items-center">
        <Text className="text-xs font-bold text-gray-400 w-7">Q{index + 1}</Text>
        <ScoreBadge score={answer.score} />
        <Text
          className="flex-1 text-sm text-gray-800 font-medium"
          numberOfLines={isOpen ? undefined : 2}
        >
          Question {answer.question_order}
        </Text>
        <Text className="text-gray-300 text-base ml-2">{isOpen ? "∧" : "∨"}</Text>
      </View>

      {/* Expanded content */}
      {isOpen && (
        <View className="mt-4 pt-4 border-t border-gray-100">
          {answer.transcript ? (
            <View className="mb-3">
              <Text className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                Your Answer
              </Text>
              <Text className="text-sm text-gray-700 leading-5">{answer.transcript}</Text>
            </View>
          ) : null}

          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
              Feedback
            </Text>
            <Text className="text-sm text-gray-700 leading-5">{answer.feedback}</Text>
          </View>

          {/* Criteria mini-bars */}
          {(answer.score_breakdown?.criteria_scores ?? []).length > 0 && (
            <View className="mt-3 flex-row gap-x-3">
              {(answer.score_breakdown?.criteria_scores ?? []).slice(0, 3).map((c) => (
                <View key={c.name} className="flex-1">
                  <Text className="text-xs text-gray-400 mb-1" numberOfLines={1}>
                    {c.name}
                  </Text>
                  <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min((c.score / 10) * 100, 100)}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Helper: grade label → color
// ---------------------------------------------------------------------------

function gradeColor(grade: string): string {
  const g = grade.toLowerCase();
  if (g.includes("excellent")) return "#3B82F6";
  if (g.includes("very good")) return "#3B82F6";
  if (g.includes("good")) return "#22C55E";
  if (g.includes("average")) return "#F59E0B";
  return "#9CA3AF";
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export function MockInterviewResultScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector((s) => s.mockInterview.sessionId);
  const finalScore = useAppSelector((s) => s.mockInterview.finalScore);
  const finalGrade = useAppSelector((s) => s.mockInterview.finalGrade);

  const { data, isLoading, isError } = useGetInterviewResultsQuery(sessionId ?? "", {
    skip: !sessionId,
  });

  // Sync API result into Redux once it loads
  if (data && (finalScore === null || finalGrade === null)) {
    dispatch(
      setFinalResult({
        score: data.session.total_score ?? 0,
        grade: data.grade,
      }),
    );
  }

  const score = finalScore ?? data?.session.total_score ?? 0;
  const grade = finalGrade ?? data?.grade ?? "";
  const answers = data?.answers ?? [];

  const handleTryAgain = useCallback(() => {
    dispatch(resetInterview());
    router.replace("/mock-interview" as Record<string, unknown>);
  }, [dispatch, router]);

  const handleGoToDashboard = useCallback(() => {
    dispatch(resetInterview());
    router.replace("/");
  }, [dispatch, router]);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center px-10">
        <Text className="text-gray-500 text-sm text-center leading-6">
          Failed to load results.{"\n"}Please check your connection.
        </Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 52 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Trophy + final score */}
        <View className="items-center mb-8">
          <TrophyIcon />
          <Text className="text-xl font-bold text-gray-900 mb-2">Interview Complete!</Text>
          <Text className="text-5xl font-bold text-gray-900">{score.toFixed(1)}/10</Text>
          <Text className="text-base font-semibold mt-2" style={{ color: gradeColor(grade) }}>
            {grade}
          </Text>
        </View>

        {/* Per-question accordion list */}
        {answers.length > 0 && (
          <>
            <Text className="text-base font-bold text-gray-900 mb-4">Your Responses</Text>
            {answers.map((answer, idx) => (
              <ResponseAccordion key={answer.question_id} index={idx} answer={answer} />
            ))}
          </>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Sticky footer: two actions */}
      <View className="px-5 pb-10 pt-4 bg-gray-100 gap-y-3">
        <Pressable
          onPress={handleTryAgain}
          className="bg-blue-500 rounded-2xl py-4 flex-row items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
        >
          {/* Refresh icon composed from text */}
          <Text className="text-white text-base mr-2">↺</Text>
          <Text className="text-white font-semibold text-base">Try Again</Text>
        </Pressable>

        <Pressable
          onPress={handleGoToDashboard}
          className="bg-white rounded-2xl py-4 flex-row items-center justify-center border border-gray-200"
          style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
        >
          {/* Home icon */}
          <Text className="text-gray-700 text-base mr-2">⌂</Text>
          <Text className="text-gray-700 font-semibold text-base">Go to Dashboard</Text>
        </Pressable>
      </View>
    </View>
  );
}
