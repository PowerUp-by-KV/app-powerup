import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
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

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, []);

  const togglePlay = async () => {
    if (!audioUrl) return;
    if (soundRef.current === null) {
      try {
        setLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          onStatus,
        );
        soundRef.current = sound;
        setIsPlaying(true);
        setHasPlayed(true);
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
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) setIsPlaying(false);
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

  return (
    <View className="flex-1">
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
        <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
          {hasPlayed ? "Listen again" : "Tap to start"}
        </Text>
        <Pressable
          onPress={togglePlay}
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: "#0f172a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Feather name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
          )}
        </Pressable>
      </View>

      {hasPlayed ? (
        <McqActivity questions={mcqs} onComplete={onComplete} />
      ) : (
        <View className="items-center justify-center py-12 px-6">
          <Text className="text-slate-500 text-center">
            Listen to the audio first — questions will appear after you start playback.
          </Text>
        </View>
      )}
    </View>
  );
}
