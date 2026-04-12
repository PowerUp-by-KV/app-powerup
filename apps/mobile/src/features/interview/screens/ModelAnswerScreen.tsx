/**
 * src/features/interview/screens/ModelAnswerScreen.tsx
 *
 * Full-screen premium model answer viewer.
 * Receives STAR fields + question as route params from QuestionFeedbackScreen.
 * Falls back to fallbackText when STAR is absent.
 *
 * Rules:
 *  - NativeWind className for static styles
 *  - inline style={{}} only for dynamic hex colours
 *  - no StyleSheet.create
 */

import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

// ── Section type ──────────────────────────────────────────────────────────────

interface StarSection {
  key:       string;
  title:     string;
  content:   string;
  bgColor:   string;
  textColor: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ModelAnswerScreen() {
  const params = useLocalSearchParams<Record<string, string>>();

  const question    = params.question    ?? "";
  const situation   = params.situation   ?? "";
  const task        = params.task        ?? "";
  const action      = params.action      ?? "";
  const result      = params.result      ?? "";
  const modelAnswer = params.fallbackText ?? "";

  const hasStar = Boolean(situation || task || action || result);

  // Only render sections that have content
  const sections: StarSection[] = [
    {
      key:       "situation",
      title:     "Situation",
      content:   situation,
      bgColor:   "#DBEAFE",
      textColor: "#2563EB",
    },
    {
      key:       "task",
      title:     "Task",
      content:   task,
      bgColor:   "#EDE9FE",
      textColor: "#7C3AED",
    },
    {
      key:       "action",
      title:     "Action",
      content:   action,
      bgColor:   "#D1FAE5",
      textColor: "#059669",
    },
    {
      key:       "result",
      title:     "Result",
      content:   result,
      bgColor:   "#FFEDD5",
      textColor: "#EA580C",
    },
  ].filter((s) => s.content.trim().length > 0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
      {/* Centering wrapper — keeps content balanced on wide screens */}
      <View className="flex-1 items-center self-center w-full">
        <View className="w-full max-w-[500px] px-5 pt-4 flex-1">

          {/* ── Header ────────────────────────────────────────────────────────── */}
          <View className="flex-row items-center mb-6">
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-white items-center justify-center mr-3"
              style={{
                shadowColor:   "#0F172A",
                shadowOpacity: 0.12,
                shadowRadius:  8,
                shadowOffset:  { width: 0, height: 3 },
                elevation:     4,
              }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Text className="text-lg text-gray-800">←</Text>
            </Pressable>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-900">Model Answer</Text>
            </View>
          </View>

          {/* ── "MODEL ANSWER" badge ──────────────────────────────────────────── */}
          <View className="items-center mb-6">
            <View className="bg-blue-100 px-4 py-1 rounded-full">
              <Text className="text-blue-700 text-xs font-semibold">
                MODEL ANSWER
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Centred content column with max-width cap */}
            <View className="items-center">
              <View className="w-full max-w-[460px]">

                {/* ── Question card ───────────────────────────────────────── */}
                {question.trim().length > 0 && (
                  <View
                    className="w-full bg-white rounded-3xl p-5 shadow-md mb-8 items-center"
                    style={{ elevation: 4 }}
                  >
                    <Text className="text-gray-500 text-sm mb-2 text-center">
                      Question
                    </Text>
                    <Text className="text-gray-900 font-semibold leading-6 text-center">
                      {question}
                    </Text>
                  </View>
                )}

                {/* ── STAR section cards ──────────────────────────────────── */}
                {sections.map((section) => (
                  <View
                    key={section.key}
                    className="w-full rounded-3xl p-5 mb-6 items-center"
                    style={{
                      backgroundColor: section.bgColor,
                      borderLeftWidth: 4,
                      borderLeftColor: section.textColor,
                      elevation:       3,
                    }}
                  >
                    <Text
                      className="font-bold text-lg mb-2 text-center"
                      style={{ color: section.textColor }}
                    >
                      {section.title}
                    </Text>
                    <View className="max-w-[420px]">
                      <Text className="text-gray-800 leading-7 text-[15px] text-center">
                        {section.content}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* ── Fallback plain-text answer ──────────────────────────── */}
                {!hasStar && (
                  <View
                    className="w-full bg-white rounded-3xl p-5 shadow-md mb-8"
                    style={{ elevation: 4 }}
                  >
                    <Text className="font-semibold text-gray-900 mb-3">Answer</Text>
                    <Text className="text-gray-700 leading-7 text-[15px]">
                      {modelAnswer.trim() || "No model answer available for this question."}
                    </Text>
                  </View>
                )}

                {/* ── Key tips ────────────────────────────────────────────── */}
                <View className="w-full bg-blue-50 rounded-3xl p-5 mb-8">
                  <Text className="font-semibold text-blue-900 mb-3">💡 Key Tips</Text>
                  <Text className="text-blue-800 leading-7 text-[15px]">
                    {"• Keep answers structured using STAR\n• Be concise but specific\n• Highlight impact in results"}
                  </Text>
                </View>

              </View>
            </View>

          </ScrollView>

          {/* ── Footer CTA ──────────────────────────────────────────────────── */}
          <View className="pt-3 pb-4">
            <Pressable
              onPress={() => router.back()}
              className="w-full bg-blue-600 py-4 rounded-2xl items-center shadow-md"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, elevation: 4 })}
            >
              <Text className="text-white font-bold text-base">Got It</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
