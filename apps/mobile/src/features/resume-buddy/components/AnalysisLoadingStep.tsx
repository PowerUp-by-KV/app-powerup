import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";

const STAGES = [
  { label: "Reading Resume Data", icon: "file-text" as const, durationMs: 1200 },
  { label: "Evaluating ATS Compatibility", icon: "shield" as const, durationMs: 1500 },
  { label: "Matching Skills", icon: "target" as const, durationMs: 1400 },
  { label: "Running AI Semantic Analysis", icon: "cpu" as const, durationMs: 1800 },
  { label: "Generating Recommendations", icon: "zap" as const, durationMs: 1600 },
  { label: "Finalizing Report", icon: "check-circle" as const, durationMs: 1000 },
];

type StageStatus = "pending" | "active" | "done";

export function AnalysisLoadingStep() {
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>(
    STAGES.map((_, i) => (i === 0 ? "active" : "pending")),
  );

  // Pulse animation for the active stage dot
  const pulse = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  // Staged timer: advance each stage after its duration
  useEffect(() => {
    let current = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const advance = () => {
      if (current >= STAGES.length - 1) return;
      const stageDuration = STAGES[current]?.durationMs ?? 1000;
      timeout = setTimeout(() => {
        current++;
        setStageStatuses((prev) =>
          prev.map((s, i) => {
            if (i < current) return "done";
            if (i === current) return "active";
            return "pending";
          }),
        );
        advance();
      }, stageDuration);
    };

    advance();
    return () => clearTimeout(timeout);
  }, []);

  const activeIndex = stageStatuses.findIndex((s) => s === "active");

  return (
    <View style={styles.container}>
      {/* Animated brain/scan icon */}
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.iconRing, { transform: [{ scale: pulse }] }]} />
        <View style={styles.iconInner}>
          <Feather name="cpu" size={36} color="#4f46e5" />
        </View>
      </View>

      <Text style={styles.title}>Analyzing Resume</Text>
      <Text style={styles.subtitle}>Our AI is scanning your resume against your target domain</Text>

      {/* Stages list */}
      <View style={styles.stagesList}>
        {STAGES.map((stage, idx) => {
          const status = stageStatuses[idx];
          const isDone = status === "done";
          const isActive = status === "active";

          return (
            <View key={stage.label} style={styles.stageRow}>
              {/* Status indicator */}
              <View
                style={[
                  styles.stageIndicator,
                  isDone && styles.indicatorDone,
                  isActive && styles.indicatorActive,
                ]}
              >
                {isDone ? (
                  <Feather name="check" size={12} color="#ffffff" />
                ) : isActive ? (
                  <Animated.View style={[styles.activeDot, { transform: [{ scale: pulse }] }]} />
                ) : (
                  <View style={styles.pendingDot} />
                )}
              </View>

              {/* Connector line (not for last item) */}
              {idx < STAGES.length - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    idx < (activeIndex >= 0 ? activeIndex : 0) && styles.connectorLineDone,
                  ]}
                />
              )}

              {/* Stage label */}
              <Text
                style={[
                  styles.stageLabel,
                  isDone && styles.stageLabelDone,
                  isActive && styles.stageLabelActive,
                ]}
              >
                {stage.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.hint}>This usually takes 10–20 seconds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#f8fafc",
  },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  iconRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(79, 70, 229, 0.08)",
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eef2ff",
    borderWidth: 2,
    borderColor: "#c7d2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 36,
    maxWidth: 280,
  },
  stagesList: {
    width: "100%",
    maxWidth: 340,
    marginBottom: 32,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    position: "relative",
  },
  stageIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
    zIndex: 1,
  },
  indicatorDone: {
    backgroundColor: "#22c55e",
  },
  indicatorActive: {
    backgroundColor: "#4f46e5",
  },
  connectorLine: {
    position: "absolute",
    left: 11,
    top: 26,
    width: 2,
    height: 20,
    backgroundColor: "#e2e8f0",
    zIndex: 0,
  },
  connectorLineDone: {
    backgroundColor: "#22c55e",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
  },
  stageLabel: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
    paddingTop: 4,
    paddingBottom: 16,
    flex: 1,
  },
  stageLabelDone: {
    color: "#334155",
    fontWeight: "600",
  },
  stageLabelActive: {
    color: "#4f46e5",
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});
