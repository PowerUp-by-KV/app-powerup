/**
 * src/features/interview/components/feedback/ScoreCard.tsx
 *
 * Large centered score inside a colored ring with a
 * Good / Average / Poor label beneath it.
 */

import React from "react";
import { View, Text } from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScoreCardProps {
  score: number; // 0–100
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLabel(score: number): string {
  if (score >= 75) return "Good";
  if (score >= 50) return "Average";
  return "Poor";
}

function getRingClass(score: number): string {
  if (score >= 75) return "border-emerald-400";
  if (score >= 50) return "border-amber-400";
  return "border-red-400";
}

function getScoreClass(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getLabelClass(score: number): string {
  if (score >= 75) return "text-emerald-600 bg-emerald-50";
  if (score >= 50) return "text-amber-500 bg-amber-50";
  return "text-red-500 bg-red-50";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <View className="items-center py-2">
      {/* Ring */}
      <View
        className={`w-32 h-32 rounded-full border-4 items-center justify-center bg-white ${getRingClass(score)}`}
      >
        <Text className={`text-5xl font-extrabold tracking-tight ${getScoreClass(score)}`}>
          {score}
        </Text>
      </View>

      {/* Label pill */}
      <View className={`mt-4 px-5 py-1 rounded-full ${getLabelClass(score)}`}>
        <Text className={`text-sm font-bold ${getScoreClass(score)}`}>{getLabel(score)}</Text>
      </View>
    </View>
  );
}
