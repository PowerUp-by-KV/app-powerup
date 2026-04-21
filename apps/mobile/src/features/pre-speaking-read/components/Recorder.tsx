import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface RecorderProps {
  isRecording: boolean;
  recordingDuration: number;
  maxDuration: number;
  onStartRecording: () => void;
  onStopRecording: (url: string) => void;
}

export function Recorder({
  isRecording,
  recordingDuration,
  maxDuration,
  onStartRecording,
  onStopRecording,
}: RecorderProps) {
  return (
    <View className="items-center py-6">
      <TouchableOpacity
        className={`${
          isRecording ? "bg-red-500" : "bg-blue-500"
        } rounded-full w-24 h-24 items-center justify-center shadow-lg`}
        activeOpacity={0.7}
        onPress={() => {
          if (isRecording) {
            onStopRecording("speaking-read-recording");
          } else {
            onStartRecording();
          }
        }}
      >
        <Text className="text-white text-3xl">{isRecording ? "⏹" : "🎤"}</Text>
      </TouchableOpacity>

      {isRecording && (
        <View className="mt-4 items-center">
          <Text className="text-red-500 font-bold text-xl">
            {recordingDuration}s / {maxDuration}s
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-red-600 font-semibold">Recording...</Text>
          </View>
        </View>
      )}

      {!isRecording && recordingDuration > 0 && (
        <View className="mt-4 items-center">
          <Text className="text-green-600 font-bold">✓ Saved</Text>
          <Text className="text-xs text-gray-600 mt-1">{recordingDuration}s recorded</Text>
        </View>
      )}
    </View>
  );
}
