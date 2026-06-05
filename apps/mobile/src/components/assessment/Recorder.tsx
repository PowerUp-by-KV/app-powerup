import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, Text, Animated, Easing } from "react-native";
import { Feather } from "@expo/vector-icons";

interface BaseRecorderProps {
  isRecording: boolean;
  recordingDuration: number;
  maxDuration: number;
  onStartRecording: () => void;
  onStopRecording: (url: string) => void;
}

/**
 * Shared pulsing background halo for active recording feedback
 */
function PulsingHalo({ isRecording, size }: { isRecording: boolean; size: number }) {
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      // Loop pulse animation 1
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim1, {
            toValue: 1.45,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim1, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Loop pulse animation 2 (staggered delay)
      const timer = setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim2, {
              toValue: 1.45,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim2, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }, 600);

      return () => clearTimeout(timer);
    } else {
      pulseAnim1.setValue(1);
      pulseAnim2.setValue(1);
    }
  }, [isRecording]);

  if (!isRecording) return null;

  const opacity1 = pulseAnim1.interpolate({
    inputRange: [1, 1.45],
    outputRange: [0.45, 0],
  });

  const opacity2 = pulseAnim2.interpolate({
    inputRange: [1, 1.45],
    outputRange: [0.45, 0],
  });

  return (
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        zIndex: -1,
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#ef4444",
          opacity: opacity1,
          transform: [{ scale: pulseAnim1 }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#ef4444",
          opacity: opacity2,
          transform: [{ scale: pulseAnim2 }],
        }}
      />
    </View>
  );
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
      <View className="relative items-center justify-center mb-4">
        <PulsingHalo isRecording={isRecording} size={96} />
        <TouchableOpacity
          className={`${
            isRecording ? "bg-rose-500 shadow-rose-200" : "bg-blue-500 shadow-blue-200"
          } rounded-full w-24 h-24 items-center justify-center shadow-lg`}
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
      </View>

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
      <View className="relative items-center justify-center mb-3">
        <PulsingHalo isRecording={isRecording} size={80} />
        <TouchableOpacity
          className={`${
            isRecording ? "bg-rose-500 shadow-rose-200" : "bg-blue-500 shadow-blue-200"
          } rounded-full w-20 h-20 items-center justify-center shadow-lg`}
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
      </View>

      {isRecording ? (
        <View className="items-center">
          <Text className="text-rose-600 font-extrabold text-2xl mb-1">
            {recordingDuration}s / {maxDuration}s
          </Text>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2" />
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
      <View className="relative items-center justify-center mb-3">
        <PulsingHalo isRecording={isRecording} size={80} />
        <TouchableOpacity
          className={`${
            isRecording ? "bg-rose-500 shadow-rose-200" : "bg-blue-500 shadow-blue-200"
          } rounded-full w-20 h-20 items-center justify-center shadow-md`}
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
      </View>

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
