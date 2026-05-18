import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export type RowState = "completed" | "in_progress" | "locked" | "available";

interface TimelineRowProps {
  title: string;
  subtitle: string;
  state: RowState;
  iconOverride?: keyof typeof Feather.glyphMap;
  badgeLabel?: string;
  progressPercent?: number;
  progressLabel?: string;
  xpLabel?: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
  onPress?: () => void;
  isLast?: boolean;
}

const stateMeta: Record<
  RowState,
  { icon: keyof typeof Feather.glyphMap; iconBg: string; iconColor: string }
> = {
  completed: { icon: "check", iconBg: "#475569", iconColor: "#ffffff" },
  in_progress: { icon: "edit-2", iconBg: "#475569", iconColor: "#ffffff" },
  available: { icon: "circle", iconBg: "#e2e8f0", iconColor: "#64748b" },
  locked: { icon: "lock", iconBg: "#475569", iconColor: "#ffffff" },
};

const badgeColors: Record<RowState, { bg: string; fg: string }> = {
  completed: { bg: "#475569", fg: "#ffffff" },
  in_progress: { bg: "#64748b", fg: "#ffffff" },
  available: { bg: "#f1f5f9", fg: "#475569" },
  locked: { bg: "#64748b", fg: "#ffffff" },
};

export function TimelineRow({
  title,
  subtitle,
  state,
  iconOverride,
  badgeLabel,
  progressPercent,
  progressLabel,
  xpLabel,
  buttonLabel,
  onButtonPress,
  onPress,
  isLast,
}: TimelineRowProps) {
  const meta = stateMeta[state];
  const badge = badgeColors[state];
  const disabled = state === "locked";
  const actualIcon = iconOverride || meta.icon;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className="flex-row items-start mb-6 active:opacity-70"
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
          <Feather name={actualIcon} size={16} color={meta.iconColor} />
        </View>
        {!isLast && <View className="flex-1 w-0.5 bg-slate-300 mt-2" style={{ minHeight: 60 }} />}
      </View>

      <View className="flex-1 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-3">
            <Text className="text-slate-900 font-extrabold text-lg">{title}</Text>
            <Text className="text-slate-500 text-sm mt-0.5">{subtitle}</Text>
          </View>
          {badgeLabel && (
            <View
              style={{
                backgroundColor: badge.bg,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: badge.fg, fontSize: 12, fontWeight: "700" }}>{badgeLabel}</Text>
            </View>
          )}
        </View>

        {progressPercent !== undefined && (
          <View className="mt-4">
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <View
                className="h-full bg-slate-700"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </View>
            <View className="flex-row justify-between items-center mb-1">
              {progressLabel ? (
                <Text className="text-slate-500 text-xs font-medium">{progressLabel}</Text>
              ) : (
                <View />
              )}
              <Text className="text-slate-700 text-xs font-bold">{progressPercent}%</Text>
            </View>
            {xpLabel && (
              <Text className="text-slate-600 text-xs font-semibold mt-0.5">{xpLabel}</Text>
            )}
          </View>
        )}

        {buttonLabel && (
          <Pressable
            onPress={onButtonPress || onPress}
            className="mt-4 self-start bg-slate-700 px-5 py-2.5 rounded-full active:opacity-80"
          >
            <Text className="text-white font-bold text-xs">{buttonLabel}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
