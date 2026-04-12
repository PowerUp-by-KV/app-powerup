/**
 * src/features/interview/components/feedback/STARMethodIndicator.tsx
 *
 * Horizontal row of S · T · A · R boxes.
 * ✅ = element present in the answer  ⚠️ = element missing.
 */

import React from "react";
import { View, Text } from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface STARData {
  situation: boolean;
  task:      boolean;
  action:    boolean;
  result:    boolean;
}

interface STARMethodIndicatorProps {
  star: STARData;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS: { key: keyof STARData; letter: string; label: string }[] = [
  { key: "situation", letter: "S", label: "Situation" },
  { key: "task",      letter: "T", label: "Task"      },
  { key: "action",    letter: "A", label: "Action"    },
  { key: "result",    letter: "R", label: "Result"    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function STARMethodIndicator({ star }: STARMethodIndicatorProps) {
  return (
    <View className="flex-row justify-between gap-2">
      {STEPS.map(({ key, letter, label }) => {
        const present = star[key];
        return (
          <View key={key} className="flex-1 items-center">

            {/* Square box badge */}
            <View
              className={[
                "w-full py-3 rounded-xl items-center justify-center mb-2 border",
                present
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200",
              ].join(" ")}
            >
              <Text
                className={`text-lg font-extrabold ${
                  present ? "text-emerald-600" : "text-amber-500"
                }`}
              >
                {letter}
              </Text>
            </View>

            {/* Status emoji */}
            <Text className="text-sm leading-4 mb-1">{present ? "✅" : "⚠️"}</Text>

            {/* Label */}
            <Text className="text-xs text-slate-500 font-semibold text-center">{label}</Text>

          </View>
        );
      })}
    </View>
  );
}
