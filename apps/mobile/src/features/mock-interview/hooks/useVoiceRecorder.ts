import { useState, useCallback, useRef } from "react";
import { Audio } from "expo-av";

export interface VoiceRecorderState {
  isRecording: boolean;
  audioFile: File | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

/**
 * useVoiceRecorder
 *
 * Local state is justified here — recording status and the resulting audio
 * URI are purely UI/session concerns that reset on unmount and are never
 * shared across screens. The hook exposes a File-compatible object so
 * submitAnswer can attach it directly to FormData.
 */
export function useVoiceRecorder(): VoiceRecorderState {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Ref keeps the Recording instance across renders without causing re-renders
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Microphone permission not granted");
        return;
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      setIsRecording(true);
      // Clear any previous recording when a new one starts
      setAudioFile(null);
    } catch (error) {
      console.warn("Failed to start recording:", error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();

      // Restore audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (uri) {
        // Fetch the local file and wrap it in a File object so RTK Query's
        // FormData submission can attach it directly as multipart/form-data.
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], "answer.m4a", { type: "audio/m4a" });
        setAudioFile(file);
      }
    } catch (error) {
      console.warn("Failed to stop recording:", error);
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    audioFile,
    startRecording,
    stopRecording,
  };
}
