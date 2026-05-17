import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";

interface AudioPlayerProps {
  audioUrl: string | null | undefined;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export function AudioPlayer({ audioUrl, onPlayStart, onPlayEnd }: AudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Unload and reset when audioUrl changes (new question)
  useEffect(() => {
    soundRef.current?.unloadAsync();
    soundRef.current = null;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, [audioUrl]);

  const handlePlayback = async () => {
    if (!audioUrl) return;

    if (isPlaying) {
      await soundRef.current?.pauseAsync();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });

      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            setPosition(status.positionMillis ?? 0);
            setDuration(status.durationMillis ?? 0);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
              onPlayEnd?.();
            }
          },
        );
        soundRef.current = sound;
      } else {
        await soundRef.current.playAsync();
      }

      setIsPlaying(true);
      onPlayStart?.();
    } catch (err) {
      console.error("Audio playback error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPct = duration > 0 ? (position / duration) * 100 : 0;
  const fmtTime = (ms: number) => `${Math.floor(ms / 1000)}s`;

  return (
    <View className="bg-blue-50 rounded-lg p-4 mb-4">
      <Text className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
        Listen to the audio
      </Text>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          className={`px-5 py-2 rounded-lg ${isLoading ? "bg-gray-400" : isPlaying ? "bg-red-500" : "bg-blue-500"}`}
          onPress={handlePlayback}
          disabled={isLoading || !audioUrl}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-semibold">{isPlaying ? "Pause" : "Play"}</Text>
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <View
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </View>
        </View>

        <Text className="text-xs text-gray-500">
          {fmtTime(position)} / {fmtTime(duration)}
        </Text>
      </View>

      {!audioUrl && (
        <Text className="text-xs text-red-400 mt-2">Audio not available for this question.</Text>
      )}
    </View>
  );
}
