import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useWaveformLevel } from "../hooks/useWaveformLevel";

interface VoiceWaveformProps {
  isSpeaking: boolean;
  color?: string;
}

const BAR_WIDTH = 4;
const BAR_GAP = 4;
const MAX_BAR_HEIGHT = 60;

export function VoiceWaveform({ isSpeaking, color = "#6366F1" }: VoiceWaveformProps) {
  const { barHeights } = useWaveformLevel({ user: isSpeaking, ai: false });

  return (
    <View style={styles.container}>
      {barHeights.map((heightSv, index) => (
        <AnimatedBar key={index} heightSv={heightSv} color={color} isActive={isSpeaking} />
      ))}
    </View>
  );
}

interface AnimatedBarProps {
  heightSv: ReturnType<typeof useWaveformLevel>["barHeights"][number];
  color: string;
  isActive: boolean;
}

function AnimatedBar({ heightSv, color, isActive }: AnimatedBarProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    height: heightSv.value,
    opacity: isActive ? 1 : 0.35,
  }));

  return (
    <Animated.View
      style={[styles.bar, { backgroundColor: color, maxHeight: MAX_BAR_HEIGHT }, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: BAR_GAP,
    height: MAX_BAR_HEIGHT,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
  },
});
