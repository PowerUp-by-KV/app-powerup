import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, GestureResponderEvent, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";

import type { ActivityQuestion } from "@powerup/shared";

import { resolveApiAssetUrl } from "@/services/api";
import { McqActivity, McqActivityResult } from "./McqActivity";

interface ListeningActivityProps {
  /** First question with `audio_url` becomes the passage; remaining are MCQs. */
  questions: ActivityQuestion[];
  onComplete: (result: McqActivityResult) => void;
}

// 32 robust preset heights for a full soundwave with no silent dots
const WAVEFORM_BARS = [
  12, 16, 22, 18, 26, 32, 40, 36, 44, 48,
  42, 30, 24, 28, 36, 44, 50, 46, 38, 32,
  24, 20, 26, 32, 38, 44, 36, 28, 22, 16,
  12, 10
];

/**
 * Audio player followed by comprehension MCQs. MCQs are hidden until the
 * learner starts playback the first time so they have to listen before answering.
 */
export function ListeningActivity({ questions, onComplete }: ListeningActivityProps) {
  const passage = questions.find((q) => !!q.audio_url);
  const mcqs = questions.filter((q) => q !== passage);
  const audioUrl = resolveApiAssetUrl(passage?.audio_url);

  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // 4 Animated values looping at different rates to create a rich audio equalizer look
  const anims = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];

  useEffect(() => {
    if (isPlaying) {
      const createAnimation = (anim: Animated.Value, dur: number, toVal: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: toVal,
              duration: dur,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: dur,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const loops = [
        createAnimation(anims[0]!, 350, 0.4),
        createAnimation(anims[1]!, 450, 0.35),
        createAnimation(anims[2]!, 400, 0.5),
        createAnimation(anims[3]!, 500, 0.3),
      ];

      loops.forEach((l) => l.start());

      return () => {
        loops.forEach((l) => l.stop());
        anims.forEach((anim) => anim.setValue(1));
      };
    } else {
      anims.forEach((anim) => anim.setValue(1));
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, []);

  const formatTime = (millis: number | null) => {
    if (millis === null || isNaN(millis)) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = async () => {
    if (!audioUrl) return;
    if (soundRef.current === null) {
      try {
        setLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true, progressUpdateIntervalMillis: 100 },
          onStatus,
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } catch {
        setLoading(false);
        return;
      }
      setLoading(false);
      return;
    }
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      if (
        status.positionMillis !== undefined &&
        status.durationMillis !== undefined &&
        status.positionMillis >= status.durationMillis
      ) {
        await soundRef.current.setPositionAsync(0);
      }
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handleSeek = async (event: GestureResponderEvent) => {
    if (!soundRef.current || duration === null || loading) return;
    const { locationX } = event.nativeEvent;
    if (containerWidth > 0) {
      const clickPercent = Math.max(0, Math.min(1, locationX / containerWidth));
      const targetMillis = clickPercent * duration;
      setPosition(targetMillis);
      try {
        await soundRef.current.setPositionAsync(targetMillis);
      } catch (err) {
        console.warn("Seeking failed:", err);
      }
    }
  };

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? null);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setHasPlayed(true);
    }
  };

  if (!audioUrl) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-slate-500 text-center">
          Audio not available for this activity yet.
        </Text>
      </View>
    );
  }

  const progressVal = hasPlayed ? 1 : (duration && position ? position / duration : 0);

  return (
    <ScrollView
      style={{
        flex: 1,
        ...Platform.select({ web: { userSelect: "none" } as any }),
      }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <View
        style={{
          marginHorizontal: 24,
          marginTop: 24,
          padding: 20,
          borderRadius: 12,
          backgroundColor: "#f1f5f9",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
          {isPlaying ? "Playing..." : hasPlayed ? "Playback completed" : "Tap to start"}
        </Text>
        <Pressable
          onPress={togglePlay}
          disabled={hasPlayed || loading}
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: hasPlayed ? "#cbd5e1" : "#0f172a",
            alignItems: "center",
            justifyContent: "center",
            ...Platform.select({ web: { cursor: "pointer" } as any }),
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : hasPlayed ? (
            <Feather name="check" size={32} color="#475569" />
          ) : (
            <Feather name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
          )}
        </Pressable>

        {/* Dynamic, Seekable Waveform Visualizer */}
        <View
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          style={{
            width: 280, // Extended width (~7cm on phone screens)
            height: 60,
            marginTop: 24,
            marginBottom: 12,
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          <Pressable
            onPress={handleSeek}
            disabled={loading || !soundRef.current}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
              width: "100%",
              ...Platform.select({ web: { cursor: "pointer" } as any }),
            }}
          >
            {WAVEFORM_BARS.map((baseHeight, index) => {
              const barProgress = index / (WAVEFORM_BARS.length - 1);
              const isPast = progressVal >= barProgress;

              return (
                <Animated.View
                  key={index}
                  style={{
                    width: 5, // Thicker bars (5dp)
                    height: baseHeight,
                    backgroundColor: isPast ? "#22c55e" : "#000000", // Green active progress, Black base waveform
                    borderRadius: 2.5, // Fully rounded thick capsules
                    transform: [{ scaleY: anims[index % anims.length]! }], // Animate all bars for a full continuous wave
                  }}
                />
              );
            })}
          </Pressable>
        </View>

        {(position !== null || duration !== null) ? (
          <Text style={{ fontSize: 13, color: "#475569", fontWeight: "600", marginTop: 4 }}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600", marginTop: 4 }}>
            0:00 / 0:00
          </Text>
        )}
      </View>

      {hasPlayed ? (
        <McqActivity questions={mcqs} onComplete={onComplete} isNested={true} />
      ) : (
        <View className="items-center justify-center py-12 px-6">
          <Text className="text-slate-500 text-center">
            Listen to the audio completely — questions will appear after the audio finishes playing once.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
