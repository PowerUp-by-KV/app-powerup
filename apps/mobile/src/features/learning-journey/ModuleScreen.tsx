import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";

import {
  useGetDayActivitiesQuery,
  useGetActivityQuestionsQuery,
  useSubmitWritingAnswerMutation,
} from "@/services/module-api";

import { TapToBuild, TapToBuildResult } from "./components/TapToBuild";
import { AnswerResultSheet } from "./components/AnswerResultSheet";

export function ModuleScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const params = useLocalSearchParams<{ day_id?: string }>();
  const dayId = params.day_id ?? "";

  const { data: activities = [], isLoading: actsLoading } = useGetDayActivitiesQuery(dayId, {
    skip: !dayId,
  });

  const [activityIdx, setActivityIdx] = useState(0);
  const currentActivity = activities[activityIdx];

  const { data: questions = [], isLoading: qLoading } = useGetActivityQuestionsQuery(
    currentActivity?.id ?? "",
    { skip: !currentActivity },
  );

  const [submitWriting] = useSubmitWritingAnswerMutation();
  const [qIdx, setQIdx] = useState(0);
  const [result, setResult] = useState<{ correct: boolean; correctSentence: string } | null>(null);

  // Skip non-tap_to_build questions so we render a clean DK-F6 flow against seeded content.
  const tapQuestions = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.question_type === "tap_to_build" &&
          Array.isArray(q.options) &&
          q.options.length > 0 &&
          !!q.correct_answer,
      ),
    [questions],
  );
  const currentQuestion = tapQuestions[qIdx];

  const handleCheck = (r: TapToBuildResult) => {
    setResult({ correct: r.correct, correctSentence: r.correctSentence.join(" ") });
  };

  const handleContinue = async () => {
    setResult(null);
    if (qIdx + 1 < tapQuestions.length) {
      setQIdx(qIdx + 1);
      return;
    }
    // Activity complete: submit + advance
    if (currentActivity && tapQuestions.length > 0) {
      try {
        await submitWriting({
          activity_id: currentActivity.id,
          answers: tapQuestions.map((q) => ({ question_id: q.id, answer: q.correct_answer ?? "" })),
        }).unwrap();
      } catch {
        // Soft-fail: still advance UX
      }
    }
    if (activityIdx + 1 < activities.length) {
      setActivityIdx(activityIdx + 1);
      setQIdx(0);
    } else {
      safeBack();
    }
  };

  if (!dayId) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-slate-500">Missing day id.</Text>
      </SafeAreaView>
    );
  }

  if (actsLoading || qLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
          <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
            <Feather name="x" size={22} color="#0f172a" />
          </Pressable>
          <Text className="flex-1 text-center font-bold text-slate-900">Module</Text>
          <View className="w-9" />
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-slate-900 text-lg font-bold mb-2 text-center">
            No interactive activities seeded for this day yet
          </Text>
          <Text className="text-slate-500 text-center text-sm">
            Tap-to-build questions will appear here once Krishanth seeds them. Other question types
            (audio, passage, writing) are still available in the assessment flow.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSteps = activities.length * Math.max(1, tapQuestions.length);
  const currentStep = activityIdx * tapQuestions.length + qIdx + 1;
  const progressPct = Math.min(100, Math.round((currentStep / Math.max(1, totalSteps)) * 100));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="x" size={22} color="#0f172a" />
        </Pressable>
        <View className="flex-1 mx-4">
          <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <View className="h-full bg-slate-900" style={{ width: `${progressPct}%` }} />
          </View>
        </View>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <TapToBuild
          promptText={currentQuestion.question_text}
          audioUrl={currentQuestion.audio_url}
          tokens={(currentQuestion.options ?? []).map((t) =>
            typeof t === "string" ? t : ((t as { text?: string }).text ?? ""),
          )}
          correctSequence={(currentQuestion.correct_answer ?? "").split(" ")}
          onCheck={handleCheck}
        />
      </ScrollView>

      <AnswerResultSheet
        visible={result !== null}
        isCorrect={result?.correct ?? false}
        correctSentence={result?.correctSentence}
        onContinue={handleContinue}
        onDismiss={() => setResult(null)}
      />
    </SafeAreaView>
  );
}
