import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Play, Pause } from "lucide-react-native";

interface AudioPlayerProps {
  url: string;
  onFinished?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, onFinished }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    async function loadSound() {
      try {
        const source = typeof url === "number" ? url : { uri: url };
        const { sound: newSound } = await Audio.Sound.createAsync(
          source,
          { shouldPlay: false },
          onPlaybackStatusUpdate,
        );
        setSound(newSound);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading sound", error);
        setIsLoading(false);
      }
    }

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        if (onFinished) onFinished();
      }
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      if (position >= duration) {
        await sound.replayAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  if (isLoading) {
    return (
      <View className="h-24 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
        <ActivityIndicator color="#475569" />
      </View>
    );
  }

  return (
    <View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={togglePlayPause}
          className="w-14 h-14 bg-[#1E293B] rounded-full items-center justify-center shadow-lg"
        >
          {isPlaying ? (
            <Pause size={28} color="white" fill="white" />
          ) : (
            <Play size={28} color="white" fill="white" className="ml-1" />
          )}
        </TouchableOpacity>

        <View className="flex-1 ml-5">
          <View className="flex-row justify-between mb-2">
            <Text className="text-[11px] font-extrabold text-[#94A3B8] uppercase tracking-[1px]">
              Audio Component
            </Text>
            <Text className="text-[11px] font-extrabold text-[#475569]">
              {Math.floor(position / 1000)}s / {Math.floor(duration / 1000)}s
            </Text>
          </View>
          <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <View style={{ width: `${progress}%` }} className="h-full bg-[#1E293B] rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
};
