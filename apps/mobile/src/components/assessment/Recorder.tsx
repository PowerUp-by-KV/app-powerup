import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

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
    <View className="items-center py-6 my-2 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
      <TouchableOpacity
        className={`${
          isRecording ? "bg-rose-500 shadow-rose-200" : "bg-slate-800 shadow-slate-300"
        } rounded-full w-24 h-24 items-center justify-center shadow-lg mb-4`}
        activeOpacity={0.8}
        onPress={() => {
          if (isRecording) {
            onStopRecording("speaking-recording-url");
          } else {
            onStartRecording();
          }
        }}
      >
        <Feather name={isRecording ? "square" : "mic"} size={36} color="white" />
      </TouchableOpacity>

      {isRecording ? (
        <View className="items-center">
          <Text className="text-rose-600 font-extrabold text-3xl mb-1">{recordingDuration}s</Text>
          <View className="flex-row items-center mb-1">
            <View className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2" />
            <Text className="text-rose-700 font-bold text-sm">Recording in progress...</Text>
          </View>
          <Text className="text-xs font-medium text-slate-400">Max limit: {maxDuration}s</Text>
        </View>
      ) : (
        <View className="items-center">
          <Text className="text-base font-bold text-slate-800 mb-1">
            {recordingDuration > 0 ? "Re-record Response" : "Tap to Record Response"}
          </Text>
          {recordingDuration > 0 ? (
            <Text className="text-xs font-semibold text-emerald-600">
              ✓ Recorded ({recordingDuration}s)
            </Text>
          ) : (
            <Text className="text-xs font-medium text-slate-400">
              Speak clearly into your microphone
            </Text>
          )}
        </View>
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
    <View className="items-center py-6 my-2 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
      <TouchableOpacity
        className={`${
          isRecording ? "bg-rose-500 shadow-rose-200" : "bg-indigo-600 shadow-indigo-200"
        } rounded-full w-20 h-20 items-center justify-center shadow-lg mb-3`}
        activeOpacity={0.8}
        onPress={() => {
          if (isRecording) {
            onStopRecording("speaking-read-recording");
          } else {
            onStartRecording();
          }
        }}
      >
        <Feather name={isRecording ? "square" : "mic"} size={32} color="white" />
      </TouchableOpacity>

      {isRecording ? (
        <View className="items-center">
          <Text className="text-rose-600 font-extrabold text-2xl mb-1">
            {recordingDuration}s / {maxDuration}s
          </Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
            <Text className="text-rose-700 font-bold text-xs">Recording...</Text>
          </View>
        </View>
      ) : (
        <View className="items-center">
          <Text className="text-sm font-bold text-slate-800 mb-1">
            {recordingDuration > 0 ? "Re-record audio" : "Start Recording"}
          </Text>
          {recordingDuration > 0 && (
            <Text className="text-xs font-semibold text-emerald-600">
              ✓ Audio saved ({recordingDuration}s)
            </Text>
          )}
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
    <View className="items-center py-5 my-2 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
      <TouchableOpacity
        className={`${
          isRecording ? "bg-rose-500 shadow-rose-200" : "bg-slate-800 shadow-slate-200"
        } rounded-full w-20 h-20 items-center justify-center shadow-md mb-3`}
        activeOpacity={0.8}
        onPress={() => {
          if (isRecording) {
            onStopRecording("recording-url");
          } else {
            onStartRecording();
          }
        }}
      >
        <Feather name={isRecording ? "square" : "mic"} size={30} color="white" />
      </TouchableOpacity>

      {isRecording ? (
        <View className="items-center">
          <Text className="text-rose-600 font-bold text-xl mb-0.5">
            {recordingDuration}s / {maxDuration}s
          </Text>
          <Text className="text-xs font-semibold text-rose-700">Recording live...</Text>
        </View>
      ) : (
        <View className="items-center">
          <Text className="text-sm font-bold text-slate-800 mb-0.5">
            {recordingDuration > 0 ? "Record Again" : "Tap to Speak"}
          </Text>
          {recordingDuration > 0 ? (
            <Text className="text-xs font-semibold text-emerald-600">
              ✓ Captured ({recordingDuration}s)
            </Text>
          ) : (
            <Text className="text-xs font-medium text-slate-400">Microphone ready</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default Recorder;
