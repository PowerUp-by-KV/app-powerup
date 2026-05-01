import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface BaseRecorderProps {
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
}: BaseRecorderProps) {
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

export function Recorder({
  isRecording,
  recordingDuration,
  maxDuration,
  onStartRecording,
  onStopRecording,
}: BaseRecorderProps) {
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

export function RecordingButton({
  isRecording,
  recordingDuration,
  maxDuration,
  onStartRecording,
  onStopRecording,
}: BaseRecorderProps) {
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

export default Recorder;
