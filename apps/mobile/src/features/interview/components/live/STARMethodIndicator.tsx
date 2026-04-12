/**
 * src/features/interview/components/live/STARMethodIndicator.tsx
 *
 * Visual STAR method analysis indicator.
 * Shows Situation, Task, Action, Result with quality indicators.
 */

import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { STARMethodAnalysis } from "../../types/interview.types";

interface STARMethodIndicatorProps {
  analysis: STARMethodAnalysis;
}

type STARKey = "situation" | "task" | "action" | "result";
type QualityType = "weak" | "good" | "excellent";

const STAR_KEYS: STARKey[] = ["situation", "task", "action", "result"];

const getQualityColor = (quality: QualityType): string => {
  switch (quality) {
    case "weak":
      return "#FF6B6B";
    case "good":
      return "#FFA500";
    case "excellent":
      return "#51CF66";
    default:
      return "#CCCCCC";
  }
};

const getQualityIcon = (quality: QualityType, present: boolean): string => {
  if (!present) return "circle-outline";
  switch (quality) {
    case "weak":
      return "alert-circle";
    case "good":
      return "check-circle";
    case "excellent":
      return "check-circle";
    default:
      return "circle-outline";
  }
};

export const STARMethodIndicator: React.FC<STARMethodIndicatorProps> = ({ analysis }) => {
  // Initialize animated values once - do not recreate on re-renders
  const animatedOpacities = React.useMemo(
    () => ({
      situation: new Animated.Value(0),
      task: new Animated.Value(0),
      action: new Animated.Value(0),
      result: new Animated.Value(0),
    }),
    [],
  );

  useEffect(() => {
    // Stagger the animations
    STAR_KEYS.forEach((key, index) => {
      Animated.timing(animatedOpacities[key], {
        toValue: 1,
        duration: 400,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const renderSTARItem = (key: STARKey) => {
    const data = analysis[key];
    const color = getQualityColor(data.quality);
    const icon = getQualityIcon(data.quality, data.present);

    return (
      <Animated.View
        key={key}
        style={[
          styles.starItem,
          {
            opacity: animatedOpacities[key],
          },
        ]}
      >
        <View style={[styles.iconContainer, { borderColor: color }]}>
          <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemLabel}>{key.toUpperCase()}</Text>
          {data.present ? (
            <Text style={[styles.itemQuality, { color }]}>
              {data.quality.charAt(0).toUpperCase() + data.quality.slice(1)}
            </Text>
          ) : (
            <Text style={styles.itemMissing}>Missing</Text>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>STAR Method Analysis</Text>
      <View style={styles.starGrid}>{STAR_KEYS.map((key) => renderSTARItem(key))}</View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Overall STAR Score</Text>
        <Text style={styles.scoreValue}>{Math.round(analysis.overallScore)}/100</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  starGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  starItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  itemContent: {
    alignItems: "center",
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  itemQuality: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  itemMissing: {
    fontSize: 11,
    fontWeight: "500",
    color: "#999",
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
});
