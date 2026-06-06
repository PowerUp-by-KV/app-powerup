/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Feather } from "@expo/vector-icons";
import { resolveApiAssetUrl } from "@/services/api";

interface AudioPlayerProps {
  audioUrl?: string | null;
  audioText?: string | null;
  duration?: number | null;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export function AudioPlayer({ audioUrl, duration = 30, onPlayStart, onPlayEnd }: AudioPlayerProps) {
  const resolvedAudioUrl = resolveApiAssetUrl(audioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration ?? 30);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  // Reset player when audioUrl changes
  useEffect(() => {
    if (sound) {
      sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setActualDuration(duration ?? 30);
  }, [resolvedAudioUrl, duration]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setIsPlaying(false);
        setIsLoading(false);
      }
      return;
    }

    if (status.durationMillis) {
      setActualDuration(Math.round(status.durationMillis / 1000));
    }
    setCurrentTime(Math.round(status.positionMillis / 1000));

    if (status.didJustFinish) {
      setIsPlaying(false);
      setCurrentTime(0);
      onPlayEnd?.();
    }
  };

  const handlePlay = async () => {
    if (!resolvedAudioUrl) {
      // Fallback timer simulation if no audio URL is provided
      setIsPlaying(true);
      onPlayStart?.();
      return;
    }

    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: resolvedAudioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);
      onPlayStart?.();
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handlePause = async () => {
    setIsPlaying(false);
    if (sound) {
      await sound.stopAsync().catch(() => {});
      await sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    setCurrentTime(0);
    onPlayEnd?.();
  };

  // Fallback simulation timer if no resolvedAudioUrl
  useEffect(() => {
    if (resolvedAudioUrl || !isPlaying) return;

    if (currentTime >= actualDuration) {
      setIsPlaying(false);
      setCurrentTime(0);
      onPlayEnd?.();
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentTime, actualDuration, resolvedAudioUrl]);

  return (
    <View className="flex-row items-center p-5 my-2.5 bg-slate-50 border border-slate-100/60 rounded-3xl shadow-sm w-full">
      <TouchableOpacity
        className="bg-blue-500 active:bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-md border border-blue-400/20"
        onPress={isPlaying ? handlePause : handlePlay}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Feather name={isPlaying ? "square" : "volume-2"} size={22} color="white" />
        )}
      </TouchableOpacity>

      <View className="ml-5">
        <Text className="text-slate-900 font-extrabold text-sm mb-0.5">
          {isLoading ? "Loading Audio..." : isPlaying ? "Playing..." : "Play audio"}
        </Text>
        <Text className="text-slate-400 font-semibold text-xs">
          Duration: {actualDuration}s {isPlaying ? `(${currentTime}s)` : ""}
        </Text>
      </View>
    </View>
  );
}

export default AudioPlayer;
