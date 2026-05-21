import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export type RowState = "completed" | "in_progress" | "locked" | "available";

interface TimelineRowProps {
  title: string;
  subtitle: string;
  state: RowState;
  badgeLabel?: string;
  progressPercent?: number;
  progressLabel?: string;
  onPress?: () => void;
  isLast?: boolean;
}

const stateMeta: Record<
  RowState,
  { icon: keyof typeof Feather.glyphMap; iconBg: string; iconColor: string }
> = {
  completed: { icon: "check", iconBg: "#0f172a", iconColor: "#ffffff" },
  in_progress: { icon: "play", iconBg: "#6366f1", iconColor: "#ffffff" },
  available: { icon: "circle", iconBg: "#e2e8f0", iconColor: "#64748b" },
  locked: { icon: "lock", iconBg: "#cbd5e1", iconColor: "#64748b" },
};

const badgeColors: Record<RowState, { bg: string; fg: string }> = {
  completed: { bg: "#dcfce7", fg: "#15803d" },
  in_progress: { bg: "#e0e7ff", fg: "#4338ca" },
  available: { bg: "#f1f5f9", fg: "#475569" },
  locked: { bg: "#f1f5f9", fg: "#94a3b8" },
};

export function TimelineRow({
  title,
  subtitle,
  state,
  badgeLabel,
  progressPercent,
  progressLabel,
  onPress,
  isLast,
}: TimelineRowProps) {
  const meta = stateMeta[state];
  const badge = badgeColors[state];
  const disabled = state === "locked";

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className="flex-row items-start mb-4 active:opacity-70"
    >
      <View className="items-center mr-4" style={{ width: 32 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: meta.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={meta.icon} size={16} color={meta.iconColor} />
        </View>
        {!isLast && <View className="flex-1 w-px bg-slate-200 mt-1" style={{ minHeight: 36 }} />}
      </View>

      <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-3">
            <Text className="text-slate-900 font-bold text-base">{title}</Text>
            <Text className="text-slate-500 text-sm mt-0.5">{subtitle}</Text>
          </View>
          {badgeLabel && (
            <View
              style={{
                backgroundColor: badge.bg,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: badge.fg, fontSize: 11, fontWeight: "700" }}>{badgeLabel}</Text>
            </View>
          )}
        </View>
        {progressPercent !== undefined && (
          <View className="mt-3">
            <View className="flex-row justify-between mb-1">
              {progressLabel && <Text className="text-slate-400 text-xs">{progressLabel}</Text>}
              <Text className="text-slate-700 text-xs font-bold">{progressPercent}%</Text>
            </View>
            <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-indigo-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}
