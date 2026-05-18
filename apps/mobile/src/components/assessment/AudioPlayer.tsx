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

export function AudioPlayer({
  audioUrl,
  audioText,
  duration = 30,
  onPlayStart,
  onPlayEnd,
}: AudioPlayerProps) {
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

  const progressPercent = actualDuration > 0 ? (currentTime / actualDuration) * 100 : 0;

  return (
    <View className="bg-slate-100 rounded-3xl p-5 mb-6 border border-slate-200/80 shadow-sm">
      <View className="flex-row items-center">
        <TouchableOpacity
          className={`${isPlaying ? "bg-red-500" : "bg-slate-800"} w-14 h-14 rounded-full items-center justify-center shadow-md mr-4`}
          onPress={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Feather name={isPlaying ? "square" : "volume-2"} size={22} color="white" />
          )}
        </TouchableOpacity>

        <View className="flex-1 justify-center">
          <Text className="text-base font-bold text-slate-900 mb-1">
            {isPlaying ? "Playing audio..." : "Play audio"}
          </Text>
          <Text className="text-xs font-medium text-slate-500" numberOfLines={2}>
            {currentTime}s / {actualDuration}s {audioText ? `• ${audioText}` : ""}
          </Text>
        </View>
      </View>

      <View className="mt-4 bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <View
          className="bg-slate-800 h-full rounded-full"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </View>
    </View>
  );
}

export default AudioPlayer;
