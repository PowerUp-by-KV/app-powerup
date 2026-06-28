import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, ActivityIndicator, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeToggle } from "@/hooks/useThemeToggle";

const STAGES = [
  { label: "Parsing Resume", icon: "file-text" as const },
  { label: "ATS Analysis", icon: "shield" as const },
  { label: "Skills Analysis", icon: "target" as const },
  { label: "Recommendation Engine", icon: "zap" as const },
  { label: "Final Report", icon: "check-circle" as const },
];

type StageStatus = "pending" | "active" | "done";

interface AnalysisLoadingStepProps {
  // Index (0-5) of the stage the backend is currently working on.
  activeStage?: number;
}

export function AnalysisLoadingStep({ activeStage = 0 }: AnalysisLoadingStepProps) {
  const { isDark } = useThemeToggle();
  const clampedActive = Math.min(Math.max(activeStage, 0), STAGES.length);

  const stageStatuses: StageStatus[] = STAGES.map((_, i) => {
    if (i < clampedActive) return "done";
    if (i === clampedActive) return "active";
    return "pending";
  });

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const isAllDone = clampedActive === STAGES.length;

  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: isDark ? "#0F1020" : "#F8F9FC" }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Card with Gradient and Glassmorphism Circles */}
      <View style={{ width: "100%", maxWidth: 560 }}>
        <LinearGradient
          colors={isDark ? ["#4338CA", "#312E81", "#064E3B"] : ["#597AF4", "#AFC0FF", "#DEF684"]}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardGradient, isDark && { shadowColor: "#000", shadowOpacity: 0.4 }]}
        >
          {/* Background overlapping semi-transparent circles */}
          <View
            style={{
              position: "absolute",
              right: -60,
              top: -60,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 20,
              bottom: -80,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
            }}
          />
          <View
            style={{
              position: "absolute",
              left: -80,
              bottom: -40,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            }}
          />

          {/* Robot / AI Icon in circular wrapper */}
          <Animated.View
            style={[
              styles.iconWrapper,
              { backgroundColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#ffffff" },
              { transform: [{ scale: pulse }] },
            ]}
          >
            <Feather name="cpu" size={28} color={isDark ? "#fff" : "#597AF4"} />
          </Animated.View>

          {/* Card Typography */}
          <Text style={styles.cardTitle}>
            {isAllDone ? "Analysis Complete!" : "Analyzing Resume"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isAllDone
              ? "Your personalized report is ready."
              : "Our AI is scanning your resume against your target domain."}
          </Text>
        </LinearGradient>
      </View>

      {/* Stages list */}
      <View style={styles.stagesList}>
        {STAGES.map((stage, idx) => {
          const status = stageStatuses[idx];
          const isDone = status === "done";
          const isActive = status === "active";

          return (
            <View
              key={stage.label}
              style={[
                styles.stageCard,
                {
                  backgroundColor: isDark ? "#1A1C29" : "#ffffff",
                  borderColor: isDark ? "#2A2D40" : "#E5E7EB",
                  shadowColor: isDark ? "#000" : "#0f172a",
                  shadowOpacity: isDark ? 0.2 : 0.02,
                },
              ]}
            >
              {/* Status indicator */}
              <View style={styles.indicatorContainer}>
                {isDone ? (
                  <View style={styles.doneCircle}>
                    <Feather name="check" size={14} color="#ffffff" />
                  </View>
                ) : isActive ? (
                  <View style={styles.activeCircle}>
                    <ActivityIndicator size="small" color="#597AF4" />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.pendingCircle,
                      {
                        backgroundColor: isDark ? "#0F1020" : "#F8F9FC",
                        borderColor: isDark ? "#2A2D40" : "#E5E7EB",
                      },
                    ]}
                  >
                    <View style={styles.pendingDot} />
                  </View>
                )}
              </View>

              {/* Stage label */}
              <Text
                style={[
                  styles.stageLabel,
                  { color: isDark ? "#94A3B8" : "#6B7280" },
                  isDone && [styles.stageLabelDone, { color: isDark ? "#F8FAFC" : "#1F2937" }],
                  isActive && styles.stageLabelActive,
                ]}
              >
                {stage.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.hint, { color: isDark ? "#64748B" : "#6B7280" }]}>
        This usually takes 10–20 seconds
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  cardGradient: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 24,
    paddingVertical: 28,
    marginBottom: 24,
    width: "100%",
    position: "relative",
    alignItems: "center",
    shadowColor: "#597AF4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
    maxWidth: 280,
  },
  stagesList: {
    width: "100%",
    maxWidth: 560,
    marginBottom: 20,
  },
  stageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    paddingVertical: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  indicatorContainer: {
    marginRight: 16,
  },
  doneCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(89, 122, 244, 0.05)",
    borderWidth: 2,
    borderColor: "#597AF4",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F8F9FC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B7280",
  },
  stageLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
  stageLabelDone: {
    color: "#1F2937",
    fontWeight: "600",
  },
  stageLabelActive: {
    color: "#597AF4",
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
});
