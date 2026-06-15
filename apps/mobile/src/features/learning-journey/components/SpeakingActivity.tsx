/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";

import type { ActivityQuestion } from "@powerup/shared";

import { useSubmitSpeakingAnswerMutation } from "@/services/module-api";

export interface SpeakingActivityResult {
  passed: boolean;
  score: number;
}

interface SpeakingActivityProps {
  activityId: string;
  questions: ActivityQuestion[];
  onComplete: (result: SpeakingActivityResult) => void;
}

interface Breakdown {
  fluency?: number;
  vocab?: number;
  grammar?: number;
  feedback?: string;
}

// 32 robust preset heights for a full soundwave with no silent dots
const WAVEFORM_BARS = [
  12, 16, 22, 18, 26, 32, 40, 36, 44, 48, 42, 30, 24, 28, 36, 44, 50, 46, 38, 32, 24, 20, 26, 32,
  38, 44, 36, 28, 22, 16, 12, 10,
];

/**
 * Record → review with waveform (playback/retake) → submit → AI score.
 */
export function SpeakingActivity({ questions, onComplete }: SpeakingActivityProps) {
  const prompt = questions[0];
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  // Playback states
  const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<number | null>(null);
  const [playbackDuration, setPlaybackDuration] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreView, setScoreView] = useState<{
    score: number;
    passed: boolean;
    feedback?: string;
    breakdown: Breakdown;
  } | null>(null);

  const [submitSpeaking] = useSubmitSpeakingAnswerMutation();

  // Equalizer loop animations
  const anims = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];

  useEffect(() => {
    if (isPlaybackPlaying) {
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
          ]),
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
  }, [isPlaybackPlaying]);

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      id = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
      recordingRef.current = null;
      playbackSound?.unloadAsync().catch(() => undefined);
    };
  }, [playbackSound]);

  const formatTime = (millis: number | null) => {
    if (millis === null || isNaN(millis)) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const startRecording = async () => {
    setError(null);
    setRecordedUri(null);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone permission required to record.");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setElapsed(0);
    } catch {
      setError("Couldn't start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    setIsRecording(false);
    try {
      await rec.stopAndUnloadAsync();
    } catch {
      // already stopped
    }
    const uri = rec.getURI();
    recordingRef.current = null;
    if (!uri) {
      setError("Recording file not found.");
      return;
    }
    setRecordedUri(uri);
  };

  const togglePlayback = async () => {
    if (!recordedUri) return;

    if (playbackSound === null) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: recordedUri },
          { shouldPlay: true, progressUpdateIntervalMillis: 100 },
          onPlaybackStatus,
        );
        setPlaybackSound(sound);
        setIsPlaybackPlaying(true);
      } catch (err) {
        console.warn("Could not play recorded audio", err);
      }
      return;
    }

    const status = await playbackSound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await playbackSound.pauseAsync();
      setIsPlaybackPlaying(false);
    } else {
      if (
        status.positionMillis !== undefined &&
        status.durationMillis !== undefined &&
        status.positionMillis >= status.durationMillis
      ) {
        await playbackSound.setPositionAsync(0);
      }
      await playbackSound.playAsync();
      setIsPlaybackPlaying(true);
    }
  };

  const onPlaybackStatus = (status: any) => {
    if (!status.isLoaded) return;
    setPlaybackPosition(status.positionMillis);
    setPlaybackDuration(status.durationMillis);
    if (status.didJustFinish) {
      setIsPlaybackPlaying(false);
    }
  };

  const handleRetake = async () => {
    if (playbackSound) {
      await playbackSound.unloadAsync().catch(() => undefined);
      setPlaybackSound(null);
    }
    setIsPlaybackPlaying(false);
    setPlaybackPosition(null);
    setPlaybackDuration(null);
    setRecordedUri(null);
    setElapsed(0);
  };

  const handleSeek = async (event: GestureResponderEvent) => {
    if (!playbackSound || playbackDuration === null) return;
    const { locationX } = event.nativeEvent;
    if (containerWidth > 0) {
      const clickPercent = Math.max(0, Math.min(1, locationX / containerWidth));
      const targetMillis = clickPercent * playbackDuration;
      setPlaybackPosition(targetMillis);
      try {
        await playbackSound.setPositionAsync(targetMillis);
      } catch (err) {
        console.warn("Seeking failed:", err);
      }
    }
  };

  const submitRecording = async () => {
    if (!recordedUri) return;

    // Stop playback if active
    if (playbackSound) {
      await playbackSound.stopAsync().catch(() => undefined);
      setIsPlaybackPlaying(false);
    }

    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("question_id", prompt?.id ?? "");

      if (Platform.OS === "web") {
        const response = await fetch(recordedUri);
        const blob = await response.blob();
        form.append("audio_file", blob, "speaking.webm");
      } else {
        form.append("audio_file", {
          uri: recordedUri,
          name: "speaking.m4a",
          type: "audio/m4a",
        } as unknown as Blob);
      }

      const res = await submitSpeaking(form).unwrap();
      const score = Number(res?.score ?? 0);
      const passed = res?.passed ?? score >= 60;
      const breakdown: Breakdown =
        (res as unknown as { score_breakdown?: Breakdown }).score_breakdown ?? {};
      const feedback = (res as any)?.feedback ?? breakdown?.feedback ?? "";
      setScoreView({ score, passed, feedback, breakdown });
    } catch {
      setError("Scoring failed. Tap retry to send again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (scoreView) {
    const getCategoryDetails = (key: string, value: number) => {
      switch (key.toLowerCase()) {
        case "relevance":
          return {
            label: "Relevance & Content",
            max: 3.0,
            formatted: `${value} / 3.0`,
            pct: (value / 3.0) * 100,
          };
        case "fluency":
          if (value <= 2.0) {
            return {
              label: "Fluency & Coherence",
              max: 2.0,
              formatted: `${value} / 2.0`,
              pct: (value / 2.0) * 100,
            };
          } else {
            return { label: "Fluency", max: 100, formatted: `${Math.round(value)}%`, pct: value };
          }
        case "vocab":
          return {
            label: "Vocabulary",
            max: 1.5,
            formatted: `${value} / 1.5`,
            pct: (value / 1.5) * 100,
          };
        case "grammar":
          return {
            label: "Grammar",
            max: 1.0,
            formatted: `${value} / 1.0`,
            pct: (value / 1.0) * 100,
          };
        case "accuracy":
          return { label: "Accuracy", max: 100, formatted: `${Math.round(value)}%`, pct: value };
        case "consistency":
          return { label: "Consistency", max: 100, formatted: `${Math.round(value)}%`, pct: value };
        default:
          return {
            label: key.charAt(0).toUpperCase() + key.slice(1),
            max: 100,
            formatted: `${value}`,
            pct: value,
          };
      }
    };

    return (
      <ScrollView
        style={[{ flex: 1 }, Platform.OS === "web" && ({ userSelect: "none" } as any)]}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      >
        <Text className="text-slate-900 text-xl font-bold mb-2">Your speaking score</Text>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "800",
            color: scoreView.passed ? "#16a34a" : "#dc2626",
          }}
        >
          {scoreView.score}
        </Text>
        <Text className="text-slate-500 mb-2">
          {scoreView.passed ? "Great work — you passed." : "Below 60% — try again for the bonus."}
        </Text>
        {scoreView.feedback ? (
          <Text
            style={{
              color: "#475569",
              marginTop: 8,
              marginBottom: 16,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {scoreView.feedback}
          </Text>
        ) : null}

        <View style={{ width: "100%", maxWidth: 400, marginTop: 16 }}>
          {Object.entries(scoreView.breakdown).map(([k, v]) => {
            if (k === "feedback" || k === "transcript" || k === "error" || typeof v !== "number")
              return null;
            const details = getCategoryDetails(k, v);
            return (
              <View key={k} style={{ marginBottom: 14 }}>
                <View
                  style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}
                >
                  <Text style={{ color: "#334155", fontWeight: "600", fontSize: 14 }}>
                    {details.label}
                  </Text>
                  <Text style={{ color: "#0f172a", fontWeight: "600", fontSize: 14 }}>
                    {details.formatted}
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: "#e2e8f0",
                    borderRadius: 3,
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.max(0, Math.min(100, details.pct))}%`,
                      backgroundColor: scoreView.passed ? "#16a34a" : "#dc2626",
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={() => onComplete({ passed: scoreView.passed, score: scoreView.score })}
          style={{
            marginTop: 24,
            borderRadius: 10,
            ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
          }}
        >
          {({ pressed }) => (
            <View
              style={{
                backgroundColor: pressed ? "#2563eb" : "#3b82f6",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Continue</Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[{ flex: 1 }, Platform.OS === "web" && ({ userSelect: "none" } as any)]}
      contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
    >
      <Text className="text-xs uppercase tracking-wider text-slate-500 mb-2">Speaking</Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#eff6ff",
          borderWidth: 1,
          borderColor: "#bfdbfe",
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <Feather name="info" size={16} color="#2563eb" />
        <Text style={{ flex: 1, fontSize: 13, color: "#1e3a8a", marginLeft: 8, lineHeight: 18 }}>
          Practice speaking the conversation dialogue below. Tap the microphone and read it out
          loud.
        </Text>
      </View>

      <Text className="text-slate-900 text-lg font-bold mb-4">{prompt?.question_text ?? ""}</Text>

      {(prompt?.criteria ?? []).length > 0 ? (
        <View
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: 10,
            padding: 14,
            marginBottom: 24,
          }}
        >
          <Text className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            You'll be scored on
          </Text>
          {(prompt?.criteria ?? []).map((c, i) => (
            <Text key={i} style={{ color: "#475569", marginBottom: 4 }}>
              • {c}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={{ alignItems: "center", marginTop: 24 }}>
        {submitting ? (
          <View style={{ alignItems: "center" }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ marginTop: 12, color: "#475569" }}>Analyzing your answer…</Text>
          </View>
        ) : recordedUri ? (
          <View style={{ width: "100%", alignItems: "center" }}>
            {/* Waveform Visualizer for Played Back Recording */}
            <View
              onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
              style={{
                width: 280, // Extended width (~7cm on phone screens)
                height: 60,
                marginBottom: 12,
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <Pressable
                onPress={handleSeek}
                disabled={!playbackSound}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: "100%",
                  width: "100%",
                  ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
                }}
              >
                {WAVEFORM_BARS.map((baseHeight, index) => {
                  const barProgress = index / (WAVEFORM_BARS.length - 1);
                  const progressVal =
                    playbackDuration && playbackPosition ? playbackPosition / playbackDuration : 0;
                  const isPast = progressVal >= barProgress;

                  return (
                    <Animated.View
                      key={index}
                      style={{
                        width: 5,
                        height: baseHeight,
                        backgroundColor: isPast ? "#3b82f6" : "#cbd5e1",
                        borderRadius: 2.5,
                        transform: [{ scaleY: anims[index % anims.length]! }],
                      }}
                    />
                  );
                })}
              </Pressable>
            </View>

            {/* Time display for playback */}
            <Text style={{ fontSize: 13, color: "#475569", fontWeight: "600", marginBottom: 16 }}>
              {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
            </Text>

            {/* Playback and Retake Buttons Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 64,
                width: "100%",
                marginTop: 16,
              }}
            >
              {/* Playback Button */}
              <View style={{ alignItems: "center" }}>
                <Pressable
                  onPress={togglePlayback}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    overflow: "hidden",
                    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
                  }}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: isPlaybackPlaying
                          ? "#22c55e"
                          : pressed
                            ? "#2563eb"
                            : "#3b82f6",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name={isPlaybackPlaying ? "pause" : "play"} size={22} color="#fff" />
                    </View>
                  )}
                </Pressable>
                <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600", marginTop: 8 }}>
                  Playback
                </Text>
              </View>

              {/* Retake Button */}
              <View style={{ alignItems: "center" }}>
                <Pressable
                  onPress={handleRetake}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#dc2626",
                    alignItems: "center",
                    justifyContent: "center",
                    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
                  }}
                >
                  <Feather name="refresh-cw" size={22} color="#fff" />
                </Pressable>
                <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600", marginTop: 8 }}>
                  Retake
                </Text>
              </View>
            </View>

            <Pressable
              onPress={submitRecording}
              style={{
                width: "100%",
                maxWidth: 280,
                marginTop: 48,
                borderRadius: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
              }}
            >
              {({ pressed }) => (
                <View
                  style={{
                    backgroundColor: pressed ? "#2563eb" : "#3b82f6",
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                    Submit Answer
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                overflow: "hidden",
                ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
              }}
            >
              {({ pressed }) => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isRecording ? "#dc2626" : pressed ? "#2563eb" : "#3b82f6",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name={isRecording ? "square" : "mic"} size={36} color="#fff" />
                </View>
              )}
            </Pressable>
            <Text style={{ marginTop: 12, color: "#64748b" }}>
              {isRecording ? `Recording… ${elapsed}s — tap to stop` : "Tap to record"}
            </Text>
          </>
        )}
      </View>

      {error ? (
        <Text style={{ marginTop: 16, color: "#dc2626", textAlign: "center" }}>{error}</Text>
      ) : null}
    </ScrollView>
  );
}
