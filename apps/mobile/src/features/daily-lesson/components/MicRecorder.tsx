import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Mic, Square } from "lucide-react-native";

interface MicRecorderProps {
  onRecordingComplete: (base64: string, uri: string) => void;
  isProcessing?: boolean;
}

export const MicRecorder = ({ onRecordingComplete, isProcessing }: MicRecorderProps) => {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {
          /* ignore */
        });
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Ensure any existing recording is cleaned up first
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        console.error("Permission to access microphone was denied");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = newRecording;
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      setIsRecording(false);
      recordingRef.current = null;
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    setIsRecording(false);
    const recordingInstance = recordingRef.current;
    recordingRef.current = null;

    try {
      await recordingInstance.stopAndUnloadAsync();
      const uri = recordingInstance.getURI();

      if (uri) {
        let base64 = "";

        if (Platform.OS === "web") {
          // Web Fallback: Fetch blob and use FileReader
          const response = await fetch(uri);
          const blob = await response.blob();
          base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string | undefined;
              resolve(res ? res.split(",")[1] || "" : ""); // Strip data URL prefix
            };
            reader.readAsDataURL(blob);
          });
        } else {
          // Native logic
          base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: "base64",
          });
        }

        onRecordingComplete(base64, uri);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  return (
    <View className="items-center justify-center">
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className="items-center justify-center"
      >
        <View
          className={`w-32 h-32 rounded-full items-center justify-center shadow-2xl ${
            isRecording ? "bg-red-500" : "bg-[#1E293B]"
          }`}
        >
          {isRecording ? (
            <Square size={40} color="white" fill="white" />
          ) : isProcessing ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <Mic size={48} color="white" />
          )}
        </View>
        <Text
          className={`mt-6 font-bold text-[18px] ${isRecording ? "text-red-500" : "text-[#1E293B]"}`}
        >
          {isRecording ? "Recording... (Tap to Stop)" : "Tap to Start Recording"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
