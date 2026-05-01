import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface AudioPlayerProps {
  audioText: string;
  duration: number;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export function AudioPlayer({ audioText, duration, onPlayStart, onPlayEnd }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(0);

  const handlePlay = () => {
    setIsPlaying(true);
    onPlayStart?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPlayEnd?.();
  };

  return (
    <View className="bg-blue-50 rounded-lg p-4 mb-4">
      <Text className="text-sm text-gray-600 mb-3 italic">{audioText}</Text>

      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          className={`${isPlaying ? "bg-red-500" : "bg-blue-500"} px-6 py-2 rounded-lg`}
          onPress={isPlaying ? handlePause : handlePlay}
        >
          <Text className="text-white font-semibold">{isPlaying ? "Stop" : "Play"}</Text>
        </TouchableOpacity>

        <View className="flex-1 ml-4">
          <View className="bg-gray-300 h-2 rounded-full overflow-hidden">
            <View
              className="bg-blue-500 h-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </View>
        </View>

        <Text className="text-xs text-gray-500 ml-2">
          {currentTime}s / {duration}s
        </Text>
      </View>
    </View>
  );
}
