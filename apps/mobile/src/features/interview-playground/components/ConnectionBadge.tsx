import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import type { InterviewStatus } from "../types";

interface ConnectionBadgeProps {
  status: InterviewStatus;
}

const STATUS_CONFIG: Record<
  InterviewStatus,
  { label: string; color: string; textColor: string; pulse: boolean }
> = {
  idle: { label: "Ready", color: "#E2E8F0", textColor: "#475569", pulse: false },
  starting: { label: "Starting…", color: "#FEF3C7", textColor: "#92400E", pulse: false },
  connecting: { label: "Connecting", color: "#FDE68A", textColor: "#B45309", pulse: false },
  live: { label: "Live", color: "#D1FAE5", textColor: "#065F46", pulse: true },
  saving: { label: "Saving…", color: "#DBEAFE", textColor: "#1E40AF", pulse: false },
  done: { label: "Done", color: "#E0E7FF", textColor: "#3730A3", pulse: false },
  error: { label: "Error", color: "#FEE2E2", textColor: "#991B1B", pulse: false },
};

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const config = STATUS_CONFIG[status];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!config.pulse) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [config.pulse, pulseAnim]);

  return (
    <View style={[styles.pill, { backgroundColor: config.color }]}>
      {config.pulse && (
        <Animated.View
          style={[styles.dot, { backgroundColor: config.textColor, opacity: pulseAnim }]}
        />
      )}
      <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    alignSelf: "flex-start",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
