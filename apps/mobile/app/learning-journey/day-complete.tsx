import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAdvanceCefrMutation, useGetModuleEngagementQuery } from "@/services/module-api";
import { CefrProgressBar } from "@/features/learning-journey/components/CefrProgressBar";

interface CelebrationOverlayProps {
  visible: boolean;
  onClose: () => void;
  type: "day" | "module";
  xpEarned: number;
  score?: number | null;
}

function CelebrationOverlay({ visible, onClose, type, xpEarned, score }: CelebrationOverlayProps) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const PARTICLE_COUNT = 30;
  const EMOJIS = ["🎉", "✨", "🔥", "⭐", "🏅", "🏆", "🍭", "💫", "🎯", "⚡", "👑", "💖"];

  // Confetti particles setup
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * (screenWidth - 40) + 20,
      y: new Animated.Value(-50),
      rotate: new Animated.Value(0),
      scale: Math.random() * 0.7 + 0.6,
      emoji: EMOJIS[i % EMOJIS.length],
    }));
  }, [screenWidth]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Smooth scale-in spring and fade-in timing
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse for the badge circle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Falling confetti shower with staggered delays
      particles.forEach((p) => {
        p.y.setValue(-50);
        p.rotate.setValue(0);
      });

      const animations = particles.map((p, i) => {
        return Animated.parallel([
          Animated.timing(p.y, {
            toValue: screenHeight + 50,
            duration: 2200 + Math.random() * 1800,
            delay: Math.random() * 1500,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: 1,
            duration: 2200 + Math.random() * 1800,
            delay: Math.random() * 1500,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start();
    }
  }, [visible, screenHeight, particles]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlayContainer, { opacity: opacityAnim }]}
    >
      {/* Dynamic Floating Confetti Elements */}
      {particles.map((p) => {
        const rotateInterpolate = p.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "720deg"],
        });

        return (
          <Animated.Text
            key={p.id}
            style={[
              styles.confettiParticle,
              {
                left: p.x,
                transform: [{ translateY: p.y }, { rotate: rotateInterpolate }, { scale: p.scale }],
              },
            ]}
          >
            {p.emoji}
          </Animated.Text>
        );
      })}

      {/* Pop-up Celebration Reward Card */}
      <Animated.View style={[styles.celebrationCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.congratsText}>CONGRATULATIONS! 🎉</Text>

        <Text style={styles.headlineText}>
          {type === "module" ? "Module Completed!" : "Day Completed!"}
        </Text>

        {/* Pulsing Trophy or Streak Booster Badge */}
        <Animated.View style={[styles.badgeContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View
            style={[
              styles.badgeCircle,
              { backgroundColor: type === "module" ? "#fef3c7" : "#dcfce7" },
            ]}
          >
            <Text style={styles.badgeEmoji}>{type === "module" ? "🏆" : "🔥"}</Text>
          </View>
        </Animated.View>

        {/* Claimable Rewards Summary */}
        <View style={styles.rewardsPanel}>
          <Text style={styles.rewardsTitle}>Rewards Claimed:</Text>

          {/* Badge Achievement Card */}
          <View style={styles.rewardItem}>
            <Text style={styles.rewardItemEmoji}>{type === "module" ? "🏅" : "✅"}</Text>
            <View style={styles.rewardItemDetails}>
              <Text style={styles.rewardItemName}>
                {type === "module" ? "Module Master Badge" : "Daily Streak Active"}
              </Text>
              <Text style={styles.rewardItemSub}>
                {type === "module"
                  ? `Scored ${score}% · CEFR Milestone!`
                  : "Active Learner Badge earned"}
              </Text>
            </View>
          </View>

          {/* XP Booster Capsule */}
          <View style={styles.rewardItem}>
            <Text style={styles.rewardItemEmoji}>⚡</Text>
            <View style={styles.rewardItemDetails}>
              <Text style={styles.rewardItemName}>+{xpEarned} XP Points</Text>
              <Text style={styles.rewardItemSub}>Added to your profile total</Text>
            </View>
          </View>
        </View>

        {/* Claim Rewards Primary CTA */}
        <Pressable onPress={handleClose} style={styles.claimButton}>
          <Text style={styles.claimButtonText}>Awesome! Claim Rewards 🚀</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * DayCompleteScreen — three rendering states driven by route params:
 *   1. Normal day:          XP + CEFR bar + Continue
 *   2. Module check passed: XP + score + badge + "Level Me Up!" CTA
 *   3. Module check failed: score + retry CTA + weak-day prompt
 */
export default function DayCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    day_number?: string;
    module_id?: string;
    xp_earned?: string;
    module_check_score?: string;
    ready_to_advance?: string;
    next_cefr?: string;
    current_cefr?: string;
    at_ceiling?: string;
  }>();

  const moduleId = params.module_id ?? "";
  const xpEarned = Number(params.xp_earned ?? 0);
  const moduleCheckScore =
    params.module_check_score && params.module_check_score.length > 0
      ? Number(params.module_check_score)
      : null;
  const readyToAdvance = params.ready_to_advance === "1";
  const atCeiling = params.at_ceiling === "1";
  const nextCefr = params.next_cefr ?? "";
  const currentCefr = params.current_cefr ?? "";

  const { data: engagement } = useGetModuleEngagementQuery(moduleId, { skip: !moduleId });
  const [advanceCefr, { isLoading: advancing }] = useAdvanceCefrMutation();
  const [advanced, setAdvanced] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const state = useMemo<"normal" | "check-passed" | "check-failed">(() => {
    if (moduleCheckScore === null) return "normal";
    return moduleCheckScore >= 70 ? "check-passed" : "check-failed";
  }, [moduleCheckScore]);

  const cefrProgressPct = engagement?.cefr_progress_pct ?? 0;
  const nextBand = engagement?.next_cefr_band ?? (nextCefr || null);

  const goHome = () => {
    if (moduleId) {
      router.replace({
        pathname: "/(tabs)/my-learning" as any,
        params: { module_id: moduleId },
      });
    } else {
      router.replace("/(tabs)/my-learning");
    }
  };

  const handleLevelUp = async () => {
    if (!moduleId) return;
    try {
      await advanceCefr(moduleId).unwrap();
      setAdvanced(true);
    } catch {
      // Best-effort: still navigate home after a moment.
    }
  };

  // ── State 2: Module check passed ───────────────────────────────────────
  if (state === "check-passed") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <CelebrationOverlay
          visible={overlayVisible}
          onClose={() => setOverlayVisible(false)}
          type="module"
          xpEarned={xpEarned}
          score={moduleCheckScore}
        />
        <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
          <Feather name="award" size={72} color="#f59e0b" style={{ marginTop: 20 }} />
          <Text className="text-3xl font-extrabold text-slate-900 mt-4">Module Complete!</Text>
          <Text className="text-slate-500 mt-2 text-center">
            You scored {moduleCheckScore}% — {readyToAdvance ? "you've earned a new level." : ""}
          </Text>

          <View
            style={{
              marginTop: 24,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 999,
              backgroundColor: "#fef3c7",
            }}
          >
            <Text style={{ color: "#92400e", fontWeight: "700" }}>+{xpEarned} XP</Text>
          </View>

          {atCeiling ? (
            <Text className="text-slate-500 mt-8 text-center">
              You're at the top — C2 mastered. No further bands to unlock.
            </Text>
          ) : advanced ? (
            <View style={{ marginTop: 32, alignItems: "center" }}>
              <Feather name="check-circle" size={48} color="#16a34a" />
              <Text className="text-2xl font-bold text-slate-900 mt-3">{nextCefr} unlocked!</Text>
              <Pressable
                onPress={goHome}
                style={{
                  marginTop: 24,
                  backgroundColor: "#0f172a",
                  paddingVertical: 14,
                  paddingHorizontal: 40,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Back to My Learning</Text>
              </Pressable>
            </View>
          ) : readyToAdvance ? (
            <View style={{ marginTop: 32, width: "100%" }}>
              <Pressable
                onPress={handleLevelUp}
                disabled={advancing}
                style={{
                  backgroundColor: advancing ? "#cbd5e1" : "#0f172a",
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {advancing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                    Level Me Up to {nextCefr} 🎉
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={goHome}
                style={{ paddingVertical: 14, alignItems: "center", marginTop: 4 }}
              >
                <Text style={{ color: "#64748b", fontWeight: "600" }}>
                  Stay at {currentCefr} for now
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={goHome}
              style={{
                marginTop: 32,
                backgroundColor: "#0f172a",
                paddingVertical: 14,
                paddingHorizontal: 40,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── State 3: Module check failed ───────────────────────────────────────
  if (state === "check-failed") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
          <Feather name="refresh-ccw" size={64} color="#64748b" style={{ marginTop: 20 }} />
          <Text className="text-2xl font-extrabold text-slate-900 mt-4 text-center">
            So close — keep practicing
          </Text>
          <Text className="text-slate-500 mt-2 text-center">
            You scored {moduleCheckScore}% — 70% is the bar to advance.
          </Text>

          <View style={{ width: "100%", marginTop: 24 }}>
            <CefrProgressBar
              currentPct={cefrProgressPct}
              nextBand={nextBand}
              label="CEFR progress"
            />
          </View>

          <Pressable
            onPress={goHome}
            style={{
              marginTop: 32,
              backgroundColor: "#0f172a",
              paddingVertical: 14,
              paddingHorizontal: 40,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Review weak days</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── State 1: Normal day complete ───────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white">
      <CelebrationOverlay
        visible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
        type="day"
        xpEarned={xpEarned}
      />
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
        <Feather name="award" size={72} color="#22c55e" style={{ marginTop: 20 }} />
        <Text className="text-3xl font-extrabold text-slate-900 mt-4">
          {params.day_number ? `Day ${params.day_number}` : "Day"} Complete!
        </Text>

        <View
          style={{
            marginTop: 16,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 999,
            backgroundColor: "#dcfce7",
          }}
        >
          <Text style={{ color: "#166534", fontWeight: "700" }}>+{xpEarned} XP</Text>
        </View>

        <View style={{ width: "100%", marginTop: 32 }}>
          <CefrProgressBar currentPct={cefrProgressPct} nextBand={nextBand} label="CEFR progress" />
        </View>

        <Pressable
          onPress={goHome}
          style={{
            marginTop: 32,
            backgroundColor: "#0f172a",
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  confettiParticle: {
    position: "absolute",
    top: 0,
    fontSize: 24,
    zIndex: 10001,
  },
  celebrationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 28,
    width: "88%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 15,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    zIndex: 10002,
  },
  congratsText: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },
  headlineText: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },
  badgeContainer: {
    marginBottom: 24,
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeEmoji: {
    fontSize: 52,
  },
  rewardsPanel: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 28,
  },
  rewardsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardItemEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  rewardItemDetails: {
    flex: 1,
  },
  rewardItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  rewardItemSub: {
    fontSize: 11,
    color: "#64748b",
  },
  claimButton: {
    backgroundColor: "#0f172a",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  claimButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
});
