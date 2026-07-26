import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";

import { VoiceWaveform } from "./VoiceWaveform";

import { useColorScheme } from "nativewind";

interface AvatarStageProps {
  aiSpeaking: boolean;
  userSpeaking: boolean;
  /** Shown under the avatar, e.g. the derived role. */
  subtitle?: string;
}

// Animated AI avatar for the interview room. The robot mascot loops continuously
// and a soft glow ring pulses while the interviewer is speaking, so the screen
// feels alive and it's obvious whose turn it is.
export function AvatarStage({ aiSpeaking, userSpeaking, subtitle }: AvatarStageProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (aiSpeaking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    glow.stopAnimation();
    Animated.timing(glow, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  }, [aiSpeaking, glow]);

  const glowStyle = {
    opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.55] }),
    transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.18] }) }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Animated.View
          style={[styles.glow, glowStyle, !isDark && { backgroundColor: "#818CF8" }]}
        />
        <View
          style={[
            styles.avatarCircle,
            !isDark && { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" },
          ]}
        >
          <LottieView
            source={require("../../../../assets/mascot/Cute Robot Flying Cartoon.json")}
            autoPlay
            loop
            speed={aiSpeaking ? 1.4 : 0.7}
            style={styles.lottie}
          />
        </View>
      </View>

      <Text style={[styles.name, !isDark && { color: "#0F172A" }]}>AI Interviewer</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, !isDark && { color: "#64748B" }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
      <Text style={[styles.statusLine, !isDark && { color: "#4F46E5" }]}>
        {aiSpeaking ? "Speaking…" : userSpeaking ? "Listening…" : "Ready when you are"}
      </Text>

      <View
        style={[
          styles.userRow,
          !isDark && { backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0" },
        ]}
      >
        <View
          style={[
            styles.micDot,
            !isDark && !userSpeaking && { backgroundColor: "#94A3B8" },
            userSpeaking && styles.micDotActive,
          ]}
        />
        <Text style={[styles.userLabel, !isDark && { color: "#334155" }]}>You</Text>
        <View style={styles.waveWrap}>
          <VoiceWaveform isSpeaking={userSpeaking} color={isDark ? "#38BDF8" : "#0284C7"} />
        </View>
      </View>
    </View>
  );
}

const AVATAR = 150;
const GLOW = AVATAR + 56;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  avatarWrap: {
    width: GLOW,
    height: GLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: GLOW,
    height: GLOW,
    borderRadius: GLOW / 2,
    backgroundColor: "#6366F1",
  },
  avatarCircle: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  lottie: {
    width: AVATAR * 0.92,
    height: AVATAR * 0.92,
  },
  name: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 2,
    maxWidth: 260,
    textAlign: "center",
  },
  statusLine: {
    color: "#818CF8",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    backgroundColor: "#1E293B",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    height: 44,
  },
  micDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#475569",
  },
  micDotActive: {
    backgroundColor: "#38BDF8",
  },
  userLabel: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
  },
  waveWrap: {
    height: 24,
    justifyContent: "center",
    transform: [{ scale: 0.4 }],
  },
});
