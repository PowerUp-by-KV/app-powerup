import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface AnalysisCardProps {
  items: string[];
  type: "strength" | "weakness" | "suggestion" | "finding";
  title: string;
}

export function AnalysisCard({ items, type, title }: AnalysisCardProps) {
  const isStrength = type === "strength";
  const isWeakness = type === "weakness";

  let iconName: keyof typeof Feather.glyphMap = "info";
  let iconColor = "#6B7280"; // Text Secondary
  let cardBgColor = "#F8F9FC"; // Neutral Background
  let cardBorderColor = "#E5E7EB"; // Neutral Border
  let textColor = "#1F2937"; // Text Primary
  let titleTextColor = "#1F2937";

  if (isStrength) {
    iconName = "check-circle";
    iconColor = "#4CAF50"; // Success Green
    cardBgColor = "rgba(76, 175, 80, 0.05)";
    cardBorderColor = "rgba(76, 175, 80, 0.2)";
    titleTextColor = "#4CAF50";
  } else if (isWeakness) {
    iconName = "alert-triangle";
    iconColor = "#EF5350"; // Error Red
    cardBgColor = "rgba(239, 83, 80, 0.05)";
    cardBorderColor = "rgba(239, 83, 80, 0.2)";
    titleTextColor = "#EF5350";
  } else if (type === "suggestion") {
    iconName = "zap";
    iconColor = "#FF9800"; // Warning Orange
    cardBgColor = "rgba(255, 152, 0, 0.05)";
    cardBorderColor = "rgba(255, 152, 0, 0.2)";
    titleTextColor = "#FF9800";
  }

  return (
    <View
      style={{
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
      }}
    >
      <View className="flex-row items-center mb-3">
        <Feather name={iconName} size={18} color={iconColor} />
        <Text
          style={{
            fontWeight: "700",
            marginLeft: 8,
            fontSize: 16,
            color: titleTextColor,
          }}
        >
          {title}
        </Text>
      </View>
      {items.length === 0 ? (
        <Text style={{ color: "#6B7280", fontSize: 14, fontStyle: "italic" }}>None detected</Text>
      ) : (
        items.map((item, idx) => (
          <View key={`${item}-${idx}`} className="flex-row items-start mt-2">
            <Feather name="arrow-right" size={12} color={iconColor} style={{ marginTop: 4 }} />
            <Text
              style={{ fontSize: 14, marginLeft: 8, flex: 1, lineHeight: 20, color: textColor }}
            >
              {item}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
