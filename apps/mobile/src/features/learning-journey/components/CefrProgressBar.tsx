import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface CefrProgressBarProps {
  /** 0–100 — how much of the way to the next CEFR band the learner has earned. */
  currentPct: number;
  /** Next band label (e.g. "B2"). Pass `null` when the learner is at C2. */
  nextBand: string | null;
  /** Optional small caption above the bar. */
  label?: string;
}

export function CefrProgressBar({ currentPct, nextBand, label }: CefrProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, currentPct));
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: clamped,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clamped, width]);

  const fillWidth = width.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const caption =
    nextBand === null
      ? "You're at the top — C2 mastered"
      : `${Math.round(clamped)}% toward ${nextBand}`;

  return (
    <View style={styles.container} accessible accessibilityRole="progressbar">
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", paddingVertical: 8 },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: "600" },
  track: {
    height: 10,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#2f95dc",
    borderRadius: 6,
  },
  caption: { fontSize: 12, color: "#374151", marginTop: 6 },
});
