import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StageStatus } from "../types";

const STAGES = [
  { label: "Reading Resume Data", icon: "file-text" as const, durationMs: 1200 },
  { label: "Evaluating ATS Compatibility", icon: "shield" as const, durationMs: 1500 },
  { label: "Matching Skills", icon: "target" as const, durationMs: 1400 },
  { label: "Running AI Semantic Analysis", icon: "cpu" as const, durationMs: 1800 },
  { label: "Generating Recommendations", icon: "zap" as const, durationMs: 1600 },
  { label: "Finalizing Report", icon: "check-circle" as const, durationMs: 1000 },
];

function getLoadingMessage(stage: string, status: string, score?: number): string {
  const s = stage.toLowerCase();
  const st = status.toLowerCase();

  if (s === "extraction") {
    if (st === "started") {
      return "Extracting resume content and identifying sections...";
    }
    return "Resume content extracted successfully.";
  }
  if (s === "ats") {
    if (st === "started") {
      return "Running ATS compatibility analysis...";
    }
    return `ATS analysis completed • Score ${score ?? 0}/20`;
  }
  if (s === "ai") {
    if (st === "started") {
      return "Evaluating resume quality with AI...";
    }
    return "Generating personalized recommendations...";
  }
  if (s === "done") {
    return "Analysis complete. Preparing your report...";
  }
  return "Analyzing resume...";
}

function getProgress(stage: string, status: string): number {
  const s = stage.toLowerCase();
  const st = status.toLowerCase();

  if (s === "extraction") {
    return st === "started" ? 10 : 25;
  }
  if (s === "ats") {
    return st === "started" ? 35 : 55;
  }
  if (s === "ai") {
    return st === "started" ? 70 : 90;
  }
  if (s === "done") {
    return 100;
  }
  return 10;
}

function getStageBadgeText(stage: string): string {
  const s = stage.toLowerCase();
  if (s === "extraction") return "RESUME EXTRACTION";
  if (s === "ats") return "ATS ANALYSIS";
  if (s === "ai") return "AI ANALYSIS";
  if (s === "done") return "FINALIZING REPORT";
  return "ANALYZING";
}

function getStatusBadgeText(status: string): string {
  const st = status.toLowerCase();
  if (st === "started") return "Started";
  if (st === "completed") return "Completed";
  return "Processing";
}

interface AnalysisLoadingStepProps {
  stageStatuses: StageStatus[];
  stage: string;
  status: string;
  score?: number;
}

export function AnalysisLoadingStep({
  stageStatuses,
  stage,
  status,
  score,
}: AnalysisLoadingStepProps) {
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

  const targetProgress = getProgress(stage, status);
  const animatedProgress = React.useRef(new Animated.Value(targetProgress)).current;
  const [displayPercent, setDisplayPercent] = React.useState(targetProgress);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: targetProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [targetProgress, animatedProgress]);

  useEffect(() => {
    const id = animatedProgress.addListener(({ value }) => {
      setDisplayPercent(Math.round(value));
    });
    return () => {
      animatedProgress.removeListener(id);
    };
  }, [animatedProgress]);

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

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

      {/* Dynamic Progress and Messages Area */}
      <View style={styles.progressContainer}>
        <View style={styles.badgeRow}>
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeText}>{getStageBadgeText(stage)}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              status.toLowerCase() === "completed"
                ? styles.statusBadgeCompleted
                : styles.statusBadgeProcessing,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                status.toLowerCase() === "completed"
                  ? styles.statusBadgeTextCompleted
                  : styles.statusBadgeTextProcessing,
              ]}
            >
              {getStatusBadgeText(status)}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.percentageText}>{displayPercent}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
        </View>

        <Text style={styles.loadingMessage}>{getLoadingMessage(stage, status, score)}</Text>
      </View>

      {/* Stages list */}
      <View style={styles.stagesList}>
        {STAGES.map((stageItem, idx) => {
          const statusVal = stageStatuses[idx];
          const isDone = statusVal === "done";
          const isActive = statusVal === "active";

          return (
            <View key={stageItem.label} style={styles.stageRow}>
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
                    idx <
                      (activeIndex >= 0
                        ? activeIndex
                        : stageStatuses[STAGES.length - 1] === "done"
                          ? STAGES.length
                          : 0) && styles.connectorLineDone,
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
                {stageItem.label}
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
    marginBottom: 20,
    maxWidth: 280,
  },
  progressContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  stageBadge: {
    backgroundColor: "rgba(79, 70, 229, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stageBadgeText: {
    color: "#4f46e5",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeProcessing: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  statusBadgeCompleted: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statusBadgeTextProcessing: {
    color: "#64748b",
  },
  statusBadgeTextCompleted: {
    color: "#065f46",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4f46e5",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: 3,
  },
  loadingMessage: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
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
