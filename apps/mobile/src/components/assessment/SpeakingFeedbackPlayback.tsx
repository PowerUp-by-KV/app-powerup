import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Feather } from "@expo/vector-icons";

interface SpeakingFeedbackPlaybackProps {
  localUri: string;
  recordedDuration: number;
  onRetake: () => void;
  onSubmit: () => void;
  submitButtonText: string;
  isSubmitting: boolean;
}

export function SpeakingFeedbackPlayback({
  localUri,
  recordedDuration,
  onRetake,
  onSubmit,
  submitButtonText,
  isSubmitting,
}: SpeakingFeedbackPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(recordedDuration || 5);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  // Reset player when localUri changes
  useEffect(() => {
    if (sound) {
      sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setActualDuration(recordedDuration || 5);
  }, [localUri, recordedDuration]);

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
    }
  };

  const handlePlay = async () => {
    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: localUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);
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
  };

  const progressPercent = actualDuration > 0 ? (currentTime / actualDuration) * 100 : 0;

  return (
    <View className="w-full mt-4">
      {/* Sleek Recording Playback Card */}
      <View className="bg-emerald-50 rounded-3xl p-5 mb-6 border border-emerald-100 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`${isPlaying ? "bg-emerald-600" : "bg-emerald-800"} w-14 h-14 rounded-full items-center justify-center shadow-md mr-4`}
            onPress={isPlaying ? handlePause : handlePlay}
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Feather name={isPlaying ? "square" : "play"} size={22} color="white" />
            )}
          </TouchableOpacity>

          <View className="flex-1 justify-center">
            <Text className="text-base font-bold text-emerald-950 mb-1">
              {isPlaying ? "Listening to your response..." : "Your recorded response"}
            </Text>
            <Text className="text-xs font-semibold text-emerald-700/80">
              {currentTime}s / {actualDuration}s
            </Text>
          </View>
        </View>

        <View className="mt-4 bg-emerald-100 h-1.5 rounded-full overflow-hidden">
          <View
            className="bg-emerald-600 h-full rounded-full"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 w-full">
        <TouchableOpacity
          onPress={onRetake}
          disabled={isSubmitting}
          className="flex-1 bg-slate-100 active:bg-slate-200 py-4 rounded-xl items-center justify-center border border-slate-200"
        >
          <Text className="text-slate-700 font-extrabold text-sm">
            Retake Audio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-slate-900 active:bg-slate-800 py-4 rounded-xl items-center justify-center shadow-sm"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-extrabold text-sm">
              {submitButtonText}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default SpeakingFeedbackPlayback;
