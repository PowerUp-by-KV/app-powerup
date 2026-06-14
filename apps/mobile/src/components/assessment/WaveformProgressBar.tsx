import React from "react";
import { View, Text } from "react-native";

interface WaveformProgressBarProps {
  currentTime: number;
  duration: number;
  barCount?: number;
  maxHeight?: number;
  colorActive?: string;
  colorInactive?: string;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Symmetric voice wave heights preset (triple lobes as shown in user screenshots)
const WAVE_PATTERN = [
  5, 8, 12, 16, 20, 24, 20, 16, 12, 15, 20, 26, 32, 38, 44, 38, 32, 26, 20, 24, 30, 38, 48, 56, 48,
  38, 30, 24, 20, 26, 32, 38, 44, 38, 32, 26, 20, 15, 12, 16, 20, 24, 20, 16, 12, 8, 5,
];

export function WaveformProgressBar({
  currentTime,
  duration,
  barCount = WAVE_PATTERN.length,
  maxHeight = 56,
  colorActive = "#22c55e", // Green
  colorInactive = "#000000", // Black
}: WaveformProgressBarProps) {
  const progress = duration > 0 ? currentTime / duration : 0;
  const activeCount = Math.min(barCount, Math.round(barCount * progress));

  // Scale preset pattern to target bar count and max height
  const scaleY = maxHeight / 56;
  const bars = Array.from({ length: barCount }, (_, index) => {
    // Wrap/map to our preset pattern
    const rawVal = WAVE_PATTERN[Math.floor((index / barCount) * WAVE_PATTERN.length)] || 8;
    return Math.max(4, Math.round(rawVal * scaleY));
  });

  return (
    <View className="items-center w-full py-4 bg-transparent">
      {/* Symmetrical Waveform bars */}
      <View className="flex-row items-center justify-center h-16 w-full px-2">
        {bars.map((barHeight, idx) => {
          const isActive = idx < activeCount;
          return (
            <View
              key={idx}
              style={{
                height: barHeight,
                width: 3.5,
                borderRadius: 2,
                backgroundColor: isActive ? colorActive : colorInactive,
                marginHorizontal: 1.8,
              }}
            />
          );
        })}
      </View>

      {/* Playback Progress Time Label */}
      <Text className="text-slate-600 font-bold text-xs mt-3.5 tracking-wide">
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
    </View>
  );
}

export default WaveformProgressBar;
