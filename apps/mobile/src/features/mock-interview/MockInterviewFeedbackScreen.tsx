/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "nativewind";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useAppSelector } from "@/store/hooks";

// ---------------------------------------------------------------------------
// Sub-component: ScoreHeader
// ---------------------------------------------------------------------------

interface ScoreHeaderProps {
  score: number;
}

function ScoreHeader({ score }: ScoreHeaderProps) {
  return (
    <View className="items-center mb-6">
      {/* Green circle with checkmark */}
      <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
        <View className="w-8 h-8 rounded-full border-2 border-green-500 items-center justify-center">
          <View
            style={{
              width: 14,
              height: 8,
              borderLeftWidth: 2.5,
              borderBottomWidth: 2.5,
              borderColor: "#22C55E",
              transform: [{ rotate: "-45deg" }],
              marginTop: -3,
            }}
          />
        </View>
      </View>

      <Text className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Great job!
      </Text>
      <Text className="text-5xl font-bold text-gray-900 dark:text-white">{score.toFixed(1)}</Text>
      <Text className="text-sm text-gray-400 dark:text-gray-500 mt-1">out of 10</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: CriteriaBar
// ---------------------------------------------------------------------------

interface CriteriaBarProps {
  label: string;
  score: number; // 0 – 10
}

function CriteriaBar({ label, score }: CriteriaBarProps) {
  const pct = Math.min((score / 10) * 100, 100);
  // Round to 2 decimal places for display — matches Figma exactly
  const displayScore = score.toFixed(2);

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-1.5">
        <Text className="text-sm text-gray-700 dark:text-gray-300">{label}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">{displayScore}/10</Text>
      </View>
      <View className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <View className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export function MockInterviewFeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const goBack = useSafeBack("/");

  // Latest feedback is stored in Redux by submitAnswer.onQueryStarted
  const latestFeedback = useAppSelector((s) => s.mockInterview.latestFeedback);
  const isComplete = useAppSelector((s) => s.mockInterview.isComplete);

  const handleNext = useCallback(() => {
    if (isComplete) {
      // Last question was just answered — go to final result
      router.replace("/mock-interview/result" as any);
    } else {
      // More questions remaining — go back to question screen;
      // getNextQuestion will auto-fetch the next one
      router.replace("/mock-interview/question" as any);
    }
  }, [isComplete, router]);

  // Guard: if Redux has no feedback yet (e.g. deep-link), show nothing harmful
  if (!latestFeedback) {
    return (
      <View className="flex-1 bg-gray-100 dark:bg-slate-900 items-center justify-center px-10">
        <Text className="text-gray-400 dark:text-gray-500 text-sm text-center">
          No feedback available yet.
        </Text>
      </View>
    );
  }

  const { score, feedback, criteriaBreakdown } = latestFeedback;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-gray-100 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 52 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 items-center justify-center mr-3 shadow-sm"
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#fff" : "#0F172A"} />
          </Pressable>
        </View>

        {/* Score header */}
        <ScoreHeader score={score} />

        {/* Criteria breakdown card */}
        <View
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Criteria Breakdown
          </Text>
          <CriteriaBar label="Clarity" score={criteriaBreakdown.clarity} />
          <CriteriaBar label="Relevance" score={criteriaBreakdown.relevance} />
          <CriteriaBar label="Confidence" score={criteriaBreakdown.confidence} />
        </View>

        {/* AI Feedback card */}
        <View
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
            AI Feedback
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-300 leading-6">{feedback}</Text>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Sticky footer */}
      <View className="px-5 pb-10 pt-4 bg-gray-100 dark:bg-slate-900">
        <Pressable
          onPress={handleNext}
          className="bg-blue-500 rounded-2xl py-4 items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
        >
          <Text className="text-white font-semibold text-base">
            {isComplete ? "View Results" : "Next Question"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
