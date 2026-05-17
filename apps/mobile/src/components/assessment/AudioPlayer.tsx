import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, TouchableOpacity, Text } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
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
  duration,
  onPlayStart,
  onPlayEnd,
}: AudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const resolvedAudioUrl = resolveApiAssetUrl(audioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(duration ?? 0);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, []);

  useEffect(() => {
    soundRef.current?.unloadAsync();
    soundRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    setDurationSeconds(duration ?? 0);
    setError(null);
  }, [resolvedAudioUrl, duration]);

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) setError("Audio could not be played.");
      return;
    }

    setIsPlaying(status.isPlaying);
    setCurrentTime(Math.floor((status.positionMillis ?? 0) / 1000));
    if (status.durationMillis) setDurationSeconds(Math.ceil(status.durationMillis / 1000));
    if (status.didJustFinish) {
      setIsPlaying(false);
      onPlayEnd?.();
    }
  };

  const togglePlay = async () => {
    if (!resolvedAudioUrl) {
      setError("Audio is not available for this question.");
      return;
    }

    try {
      setError(null);
      if (soundRef.current === null) {
        setIsLoading(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: resolvedAudioUrl },
          { shouldPlay: true },
          onStatus,
        );
        soundRef.current = sound;
        onPlayStart?.();
        return;
      }

      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        onPlayEnd?.();
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        onPlayStart?.();
      }
    } catch (err) {
      console.error("Audio playback failed", err);
      setError("Audio could not be played. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPct = durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  return (
    <View className="bg-blue-50 rounded-lg p-4 mb-4">
      {audioText ? <Text className="text-sm text-gray-600 mb-3 italic">{audioText}</Text> : null}

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          className={`${isPlaying ? "bg-red-500" : "bg-blue-500"} px-6 py-2 rounded-lg`}
          onPress={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">{isPlaying ? "Pause" : "Play"}</Text>
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <View
              className="bg-blue-500 h-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
          </View>
        </View>

        <Text className="text-xs text-gray-500 ml-2">
          {currentTime}s / {durationSeconds || "--"}s
        </Text>
      </View>
      {error ? <Text className="text-xs text-red-600 mt-2">{error}</Text> : null}
    </View>
  );
}

export default AudioPlayer;
