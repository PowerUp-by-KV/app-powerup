/**
 * src/features/interview/components/feedback/FeedbackItem.tsx
 *
 * Single feedback card: left-border color accent + type-driven icon + message.
 */

import React from "react";
import { View, Text } from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FeedbackType = "good" | "warning" | "tip";

export interface FeedbackItemProps {
  type: FeedbackType;
  text: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ICON: Record<FeedbackType, string> = {
  good:    "✅",
  warning: "⚠️",
  tip:     "💡",
};

const BG: Record<FeedbackType, string> = {
  good:    "bg-emerald-50",
  warning: "bg-amber-50",
  tip:     "bg-blue-50",
};

const BORDER: Record<FeedbackType, string> = {
  good:    "border-l-emerald-400",
  warning: "border-l-amber-400",
  tip:     "border-l-blue-400",
};

const TEXT: Record<FeedbackType, string> = {
  good:    "text-emerald-800",
  warning: "text-amber-800",
  tip:     "text-blue-800",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function FeedbackItem({ type, text }: FeedbackItemProps) {
  return (
    <View
      className={[
        "flex-row items-start px-4 py-3.5 mb-3 rounded-xl border-l-4",
        BG[type],
        BORDER[type],
      ].join(" ")}
    >
      <Text className="text-base mr-3 leading-5">{ICON[type]}</Text>
      <Text className={`flex-1 text-sm font-medium leading-5 ${TEXT[type]}`}>
        {text}
      </Text>
    </View>
  );
}
