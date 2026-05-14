import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { ActivityQuestion } from "@powerup/shared";

import {
  useGetActivityQuestionsQuery,
  useSubmitWritingAnswerMutation,
} from "@/services/module-api";

import { QuizEngine } from "./QuizEngine";
import { PLACEHOLDER_QUESTIONS } from "../constants/quiz-data";
import type { QuizQuestion } from "../types/quiz.types";

interface QuizShellProps {
  activityId: string;
  fallbackQuestions?: QuizQuestion[];
  onActivityComplete?: () => void;
}

function toMcqQuizQuestion(q: ActivityQuestion): QuizQuestion | null {
  if (!q.options || q.options.length === 0 || !q.correct_answer) return null;
  return {
    id: q.id,
    sentence: q.question_text,
    options: q.options,
    answer: q.correct_answer,
  };
}

export function QuizShell({ activityId, fallbackQuestions, onActivityComplete }: QuizShellProps) {
  const router = useRouter();
  const skip = !activityId;
  const { data, isLoading, isError } = useGetActivityQuestionsQuery(activityId, { skip });
  const [submitWriting, { isLoading: isSubmitting }] = useSubmitWritingAnswerMutation();
  const [completion, setCompletion] = useState<{
    score: number;
    total: number;
    xp?: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = useMemo<QuizQuestion[]>(() => {
    if (!data || data.length === 0) return fallbackQuestions ?? PLACEHOLDER_QUESTIONS;
    const mcq = data.map(toMcqQuizQuestion).filter((q): q is QuizQuestion => q !== null);
    return mcq.length > 0 ? mcq : (fallbackQuestions ?? PLACEHOLDER_QUESTIONS);
  }, [data, fallbackQuestions]);

  const handleQuizComplete = useCallback(
    async (score: number) => {
      const total = questions.length;
      if (!activityId) {
        setCompletion({ score, total });
        return;
      }
      try {
        const result = await submitWriting({
          activity_id: activityId,
          answers: questions.map((q) => ({ question_id: q.id, answer: q.answer })),
        }).unwrap();
        setCompletion({ score, total, xp: result?.xp_earned });
      } catch (err) {
        setSubmitError(
          err && typeof err === "object" && "data" in err
            ? "Could not save your score. Tap retry."
            : "Network error. Tap retry.",
        );
        setCompletion({ score, total });
      }
    },
    [activityId, questions, submitWriting],
  );

  const handleRetrySubmit = useCallback(async () => {
    if (!activityId || !completion) return;
    setSubmitError(null);
    try {
      const result = await submitWriting({
        activity_id: activityId,
        answers: questions.map((q) => ({ question_id: q.id, answer: q.answer })),
      }).unwrap();
      setCompletion({ ...completion, xp: result?.xp_earned });
    } catch {
      setSubmitError("Still failing. Try again later.");
    }
  }, [activityId, completion, questions, submitWriting]);

  if (!skip && isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-slate-300">Loading questions…</Text>
      </View>
    );
  }

  if (completion) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900 px-8">
        <Text className="text-6xl mb-4">🎉</Text>
        <Text className="text-white text-3xl font-extrabold mb-2">Activity complete!</Text>
        <Text className="text-slate-300 text-lg mb-1">
          {completion.score} / {completion.total} correct
        </Text>
        {completion.xp !== undefined && (
          <Text className="text-emerald-400 text-2xl font-bold mt-2">+{completion.xp} XP</Text>
        )}
        {submitError && (
          <View className="mt-6 items-center">
            <Text className="text-rose-300 mb-3 text-center">{submitError}</Text>
            <Pressable
              onPress={handleRetrySubmit}
              disabled={isSubmitting}
              className="bg-slate-700 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-semibold">
                {isSubmitting ? "Retrying…" : "Retry submit"}
              </Text>
            </Pressable>
          </View>
        )}
        <Pressable
          onPress={() => {
            if (onActivityComplete) onActivityComplete();
            else router.replace("/(tabs)");
          }}
          className="mt-10 bg-indigo-500 px-10 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold text-lg">Next activity</Text>
        </Pressable>
      </View>
    );
  }

  if (!skip && isError) {
    return (
      <View className="flex-1 bg-slate-900">
        <View className="p-4">
          <Text className="text-amber-300 text-center text-sm">
            Couldn&apos;t reach server — showing offline practice set.
          </Text>
        </View>
        <QuizEngine
          questions={fallbackQuestions ?? PLACEHOLDER_QUESTIONS}
          onComplete={handleQuizComplete}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <QuizEngine questions={questions} onComplete={handleQuizComplete} />
    </View>
  );
}
