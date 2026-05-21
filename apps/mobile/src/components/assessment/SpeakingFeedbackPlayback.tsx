import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Feather } from "@expo/vector-icons";
import { WaveformProgressBar } from "./WaveformProgressBar";

interface SpeakingFeedbackPlaybackProps {
  localUri: string | null;
  recordedDuration: number;
  onRetake: () => void;
  onSubmit: () => void;
  submitButtonText: string;
  isSubmitting?: boolean;
}

export function SpeakingFeedbackPlayback({
  localUri,
  recordedDuration,
  onRetake,
  onSubmit,
  submitButtonText,
  isSubmitting = false,
}: SpeakingFeedbackPlaybackProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recordedDuration || 5);

  // Sync state duration
  useEffect(() => {
    if (recordedDuration) {
      setDuration(recordedDuration);
    }
  }, [recordedDuration]);

  // Cleanup on unmount/uri change
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound, localUri]);

  // Handle local playback
  const handlePlayback = async () => {
    if (!localUri) return;

    if (isPlaying) {
      // Pause/Stop
      setIsPlaying(false);
      setCurrentTime(0);
      if (sound) {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
        setSound(null);
      }
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: localUri },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          if (status.durationMillis) {
            setDuration(Math.round(status.durationMillis / 1000));
          }
          setCurrentTime(Math.round(status.positionMillis / 1000));

          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        },
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (err) {
      console.warn("Failed to play local audio:", err);
    }
  };

  const handleRetakeClick = async () => {
    // Discard sound
    setIsPlaying(false);
    setCurrentTime(0);
    if (sound) {
      await sound.stopAsync().catch(() => {});
      await sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    onRetake();
  };

  return (
    <View className="items-center py-6 my-2 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm w-full">
      {/* Waveform Visualization of user's recorded audio */}
      <WaveformProgressBar currentTime={currentTime} duration={duration} />

      {/* Control Buttons (Playback, Retake) */}
      <View className="flex-row items-center justify-center gap-12 mt-4 mb-6">
        {/* Playback Button */}
        <View className="items-center">
          <TouchableOpacity
            className="bg-[#0b132b] w-16 h-16 rounded-full items-center justify-center shadow-md border border-slate-700/20 active:opacity-90"
            onPress={handlePlayback}
            activeOpacity={0.8}
          >
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="white"
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </TouchableOpacity>
          <Text className="text-slate-600 font-bold text-xs mt-2">Playback</Text>
        </View>

        {/* Retake Button */}
        <View className="items-center">
          <TouchableOpacity
            className="bg-red-500 w-16 h-16 rounded-full items-center justify-center shadow-md border border-red-600/20 active:opacity-90"
            onPress={handleRetakeClick}
            activeOpacity={0.8}
          >
            <Feather name="rotate-ccw" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-slate-600 font-bold text-xs mt-2">Retake</Text>
        </View>
      </View>

      {/* Submit/Next Button - Conditionally styled and clickable */}
      <TouchableOpacity
        className={`w-11/12 py-4 rounded-2xl items-center justify-center shadow-md ${
          isSubmitting ? "bg-slate-400" : "bg-[#0b132b]"
        }`}
        onPress={onSubmit}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <View className="flex-row items-center justify-center gap-2">
            <ActivityIndicator color="white" size="small" />
            <Text className="text-white font-bold text-base">Uploading Audio...</Text>
          </View>
        ) : (
          <Text className="text-white font-bold text-base">{submitButtonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default SpeakingFeedbackPlayback;
