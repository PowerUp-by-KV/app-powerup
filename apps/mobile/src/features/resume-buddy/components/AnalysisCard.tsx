import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface AnalysisCardProps {
  items: string[];
  type: "strength" | "weakness" | "suggestion" | "finding";
  title: string;
}

export function AnalysisCard({ items, type, title }: AnalysisCardProps) {
  const itemsVal = items ?? [];
  const isStrength = type === "strength";
  const isWeakness = type === "weakness";

  let iconName: keyof typeof Feather.glyphMap = "info";
  let iconColor = "#64748b"; // Neutral slate
  let cardBg = "bg-slate-50 border-slate-100";
  let textColor = "text-slate-800";

  if (isStrength) {
    iconName = "check-circle";
    iconColor = "#22c55e"; // Green
    cardBg = "bg-emerald-50/50 border-emerald-100/60";
    textColor = "text-emerald-950";
  } else if (isWeakness) {
    iconName = "alert-triangle";
    iconColor = "#ef4444"; // Red
    cardBg = "bg-red-50/50 border-red-100/60";
    textColor = "text-red-950";
  } else if (type === "suggestion") {
    iconName = "zap";
    iconColor = "#d97706"; // Amber
    cardBg = "bg-amber-50/50 border-amber-100/60";
    textColor = "text-amber-950";
  }

  return (
    <View className={`rounded-2xl p-5 mb-4 border ${cardBg}`}>
      <View className="flex-row items-center mb-3">
        <Feather name={iconName} size={18} color={iconColor} />
        <Text
          className={`font-bold ml-2 text-base ${isStrength ? "text-emerald-900" : isWeakness ? "text-red-900" : type === "suggestion" ? "text-amber-900" : "text-slate-900"}`}
        >
          {title}
        </Text>
      </View>
      {itemsVal.length === 0 ? (
        <Text className="text-slate-400 text-sm italic">None detected</Text>
      ) : (
        itemsVal.map((item, idx) => (
          <View key={`${item}-${idx}`} className="flex-row items-start mt-2">
            <Feather name="arrow-right" size={12} color={iconColor} style={{ marginTop: 4 }} />
            <Text className={`text-sm ml-2 flex-1 leading-5 ${textColor}`}>{item}</Text>
          </View>
        ))
      )}
    </View>
  );
}
