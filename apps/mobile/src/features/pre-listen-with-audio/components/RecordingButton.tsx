import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

interface RecordingButtonProps {
  isRecording: boolean;
  recordingDuration: number;
  maxDuration: number;
  onStartRecording: () => void;
  onStopRecording: (url: string) => void;
}

export function RecordingButton({
  isRecording,
  recordingDuration,
  maxDuration,
  onStartRecording,
  onStopRecording,
}: RecordingButtonProps) {
  return (
    <View className="items-center py-4">
      <TouchableOpacity
        className={`${
          isRecording ? "bg-red-500" : "bg-green-500"
        } rounded-full w-24 h-24 items-center justify-center`}
        onPress={() => {
          if (isRecording) {
            onStopRecording("recording-url");
          } else {
            onStartRecording();
          }
        }}
      >
        <Text className="text-white text-2xl">{isRecording ? "⏹" : "🎤"}</Text>
      </TouchableOpacity>

      {isRecording && (
        <View className="mt-3 items-center">
          <Text className="text-red-500 font-bold text-lg">
            {recordingDuration}s / {maxDuration}s
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Recording...</Text>
        </View>
      )}
    </View>
  );
}
