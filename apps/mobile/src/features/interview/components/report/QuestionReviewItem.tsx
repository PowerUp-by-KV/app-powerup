/**
 * src/features/interview/components/report/QuestionReviewItem.tsx
 *
 * Expandable question row: collapsed shows index + title + score badge;
 * expanded reveals feedback text and a mini score breakdown.
 * Expand/collapse is animated with Animated.timing on maxHeight.
 */

import React, { useRef, useState } from "react";
import { Animated, TouchableOpacity, View, Text } from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuestionReviewItemProps {
  index:     number;
  question:  string;
  score:     number;
  feedback?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLLAPSED_H = 0;
const EXPANDED_H  = 140;
const DURATION    = 260;

// ── Helpers ───────────────────────────────────────────────────────────────────

const badgeBgColor  = (s: number): string => s >= 75 ? "#10B981" : s >= 50 ? "#FBBF24" : "#F87171";
const scoreTextColor = (s: number): string => s >= 75 ? "#16A34A" : s >= 50 ? "#D97706" : "#DC2626";

// ── Component ─────────────────────────────────────────────────────────────────

export function QuestionReviewItem({ index, question, score, feedback }: QuestionReviewItemProps) {
  const [open, setOpen]   = useState(false);
  const anim              = useRef(new Animated.Value(COLLAPSED_H)).current;

  const toggle = () => {
    Animated.timing(anim, {
      toValue:         open ? COLLAPSED_H : EXPANDED_H,
      duration:        DURATION,
      useNativeDriver: false,
    }).start();
    setOpen((prev) => !prev);
  };

  return (
    <View className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm">

      {/* Collapsed row */}
      <TouchableOpacity
        className="flex-row items-center px-4 py-4"
        onPress={toggle}
        activeOpacity={0.8}
      >
        {/* Index badge */}
        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Text className="text-xs font-extrabold text-blue-600">Q{index}</Text>
        </View>

        {/* Title */}
        <Text className="flex-1 text-sm font-semibold text-slate-800" numberOfLines={1}>
          {question}
        </Text>

        {/* Score badge */}
        <View className="px-3 py-1 rounded-full mr-2" style={{ backgroundColor: badgeBgColor(score) }}>
          <Text className="text-xs font-bold text-white">{score}/100</Text>
        </View>

        {/* Chevron */}
        <Text className="text-slate-400 text-base">{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Animated expanded body */}
      <Animated.View style={{ maxHeight: anim, overflow: "hidden" }}>
        <View className="px-4 pb-4 border-t border-slate-100">

          {/* Feedback */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-3 mb-1">
            Feedback
          </Text>
          {feedback ? (
            <Text className="text-sm text-slate-600 leading-5">{feedback}</Text>
          ) : (
            <Text className="text-sm text-slate-400 italic leading-5">No feedback available.</Text>
          )}

          {/* Score indicator */}
          <View className="flex-row items-center mt-3">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-2">Score</Text>
            <View className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${score}%`, backgroundColor: badgeBgColor(score) }}
              />
            </View>
            <Text
              className="text-xs font-bold ml-2 w-8 text-right"
              style={{ color: scoreTextColor(score) }}
            >{score}</Text>
          </View>

        </View>
      </Animated.View>
    </View>
  );
}
