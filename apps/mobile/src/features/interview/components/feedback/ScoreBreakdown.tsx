/**
 * src/features/interview/components/feedback/ScoreBreakdown.tsx
 *
 * Single-row layout per category:  Label | Animated bar | Percentage
 * Each bar animates from 0 → value on mount using the Animated API.
 */

import React, { useEffect, useRef } from "react";
import { Animated, View, Text } from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BreakdownData {
  relevance: number;
  structure: number;
  clarity:   number;
  depth:     number;
}

interface ScoreBreakdownProps {
  breakdown: BreakdownData;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROWS: { key: keyof BreakdownData; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "structure", label: "Structure" },
  { key: "clarity",   label: "Clarity"   },
  { key: "depth",     label: "Depth"     },
];

// ── Sub-component ─────────────────────────────────────────────────────────────

function BreakdownRow({ label, value }: { label: string; value: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         value,
      duration:        700,
      useNativeDriver: false,
    }).start();
  }, [anim, value]);

  const width = anim.interpolate({
    inputRange:  [0, 100],
    outputRange: ["0%", "100%"],
  });

  const barColor =
    value >= 75 ? "bg-emerald-500" :
    value >= 50 ? "bg-amber-400"   :
                  "bg-red-400";

  const pctColor =
    value >= 75 ? "text-emerald-600" :
    value >= 50 ? "text-amber-500"   :
                  "text-red-500";

  return (
    <View className="flex-row items-center mb-4">
      {/* Label — fixed width so bars stay aligned */}
      <Text className="text-xs font-semibold text-slate-500 w-20">{label}</Text>

      {/* Animated bar track */}
      <View className="flex-1 mx-3 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <Animated.View
          className={`h-full rounded-full ${barColor}`}
          style={{ width }}
        />
      </View>

      {/* Percentage — fixed width, right-aligned */}
      <Text className={`text-xs font-bold w-8 text-right ${pctColor}`}>{value}%</Text>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <View>
      {ROWS.map(({ key, label }) => (
        <BreakdownRow key={key} label={label} value={breakdown[key]} />
      ))}
    </View>
  );
}
