import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface RecordingControlsProps {
  isRecording: boolean;
  recordingDuration: number;
  maxDuration: number;
  onStartRecording: () => void;
  onStopRecording: (url: string) => void;
}

export function RecordingControls({
  isRecording,
  recordingDuration,
  maxDuration,
  onStartRecording,
  onStopRecording,
}: RecordingControlsProps) {
  return (
    <View className="items-center py-6">
      <TouchableOpacity
        className={`${
          isRecording ? "bg-red-500" : "bg-green-500"
        } rounded-full w-28 h-28 items-center justify-center shadow-lg`}
        activeOpacity={0.7}
        onPress={() => {
          if (isRecording) {
            onStopRecording("speaking-recording-url");
          } else {
            onStartRecording();
          }
        }}
      >
        <Text className="text-white text-4xl">{isRecording ? "⏹" : "🎤"}</Text>
      </TouchableOpacity>

      {isRecording && (
        <View className="mt-4 items-center">
          <Text className="text-red-500 font-bold text-2xl">{recordingDuration}s</Text>
          <View className="flex-row items-center mt-2">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
            <Text className="text-red-600 font-semibold">Recording...</Text>
          </View>
          <Text className="text-xs text-gray-500 mt-2">Max: {maxDuration}s</Text>
        </View>
      )}

      {!isRecording && recordingDuration > 0 && (
        <Text className="text-green-600 font-semibold mt-4">
          ✓ Recording saved ({recordingDuration}s)
        </Text>
      )}
    </View>
  );
}
