/**
 * src/features/interview/components/ScoreIndicator.tsx
 *
 * Renders a single question's score as a circular gauge with
 * a colour that changes based on the score level.
 *
 * Also exposes a horizontal ProgressBar variant used in the SummaryScreen.
 */

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ScoreColor {
  ring: string;
  fill: string;
  label: string;
}

function getScoreColor(score: number, maxScore: number): ScoreColor {
  const pct = score / maxScore;
  if (pct >= 0.8) return { ring: "#22C55E", fill: "#DCFCE7", label: "#166534" };
  if (pct >= 0.5) return { ring: "#F59E0B", fill: "#FEF3C7", label: "#92400E" };
  return { ring: "#EF4444", fill: "#FEE2E2", label: "#991B1B" };
}

// ── Circular Score Indicator ──────────────────────────────────────────────────

interface ScoreIndicatorProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
}

export function ScoreIndicator({
  score,
  maxScore = 10,
  size = 72,
  label,
}: ScoreIndicatorProps) {
  const colors = getScoreColor(score, maxScore);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  return (
    <View style={styles.indicatorWrapper}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.ring,
            backgroundColor: colors.fill,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text
          style={[
            styles.scoreNumber,
            { color: colors.label, fontSize: size * 0.32 },
          ]}
        >
          {score}
        </Text>
        <Text
          style={[
            styles.scoreMax,
            { color: colors.label, fontSize: size * 0.16 },
          ]}
        >
          / {maxScore}
        </Text>
      </Animated.View>
      {label ? <Text style={styles.scoreLabel}>{label}</Text> : null}
    </View>
  );
}

// ── Horizontal Progress Bar ───────────────────────────────────────────────────

interface ProgressBarProps {
  score: number;
  maxScore?: number;
  height?: number;
}

export function ScoreProgressBar({
  score,
  maxScore = 10,
  height = 8,
}: ProgressBarProps) {
  const colors = getScoreColor(score, maxScore);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: score / maxScore,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [score, maxScore, widthAnim]);

  return (
    <View style={[styles.barTrack, { height }]}>
      <Animated.View
        style={[
          styles.barFill,
          {
            height,
            backgroundColor: colors.ring,
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  indicatorWrapper: {
    alignItems: "center",
    gap: 6,
  },
  circle: {
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontWeight: "800",
    lineHeight: undefined,
  },
  scoreMax: {
    fontWeight: "500",
    marginTop: -4,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  barTrack: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    borderRadius: 100,
    overflow: "hidden",
  },
  barFill: {
    borderRadius: 100,
  },
});
