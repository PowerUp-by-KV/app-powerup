import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import type { InterviewStatus, TranscriptTurn } from "../types";
import {
  activeSession,
  onSpeakingChange,
  onStatusChange,
  onTranscriptChange,
} from "../store/interviewSession";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { VoiceWaveform } from "../components/VoiceWaveform";
import { useWebRTCInterview } from "../hooks/useWebRTCInterview";

interface InterviewRoomScreenProps {
  sessionId: string | undefined;
  mode?: "buddy" | "playground";
}

export function InterviewRoomScreen({ sessionId, mode = "playground" }: InterviewRoomScreenProps) {
  const [status, setLocalStatus] = useState<InterviewStatus>(activeSession.status);
  const [transcript, setLocalTranscript] = useState<TranscriptTurn[]>(activeSession.transcript);
  const [isSpeaking, setLocalSpeaking] = useState(activeSession.isSpeaking);
  const [isEnding, setIsEnding] = useState(false);

  const { endInterview } = useWebRTCInterview();

  useEffect(() => {
    const unsubStatus = onStatusChange((s) => setLocalStatus(s));
    const unsubTranscript = onTranscriptChange((turns) => setLocalTranscript([...turns]));
    const unsubSpeaking = onSpeakingChange((speaking) => setLocalSpeaking({ ...speaking }));

    return () => {
      unsubStatus();
      unsubTranscript();
      unsubSpeaking();
    };
  }, []);

  useEffect(() => {
    if (status === "done" && sessionId) {
      router.replace({ pathname: "/interview-results", params: { session_id: sessionId, mode } });
    } else if (status === "error") {
      Alert.alert("Interview Error", activeSession.errorMessage ?? "An error occurred.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [status, sessionId]);

  const handleEnd = useCallback(async () => {
    if (isEnding) return;

    Alert.alert("End Interview?", "Are you sure you want to end the interview?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          setIsEnding(true);
          await endInterview();
          setIsEnding(false);
        },
      },
    ]);
  }, [endInterview, isEnding]);

  const isConnecting = status === "connecting" || status === "starting";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.roleName} numberOfLines={1}>
          {activeSession.derivedRole ?? "AI Interview"}
        </Text>
        <ConnectionBadge status={status} />
      </View>

      {(isConnecting || status === "live") && (
        <View style={styles.waveformSection}>
          <View style={styles.waveformItem}>
            <VoiceWaveform isSpeaking={isSpeaking.ai} color="#4F46E5" />
            <Text style={styles.waveformLabel}>AI Interviewer</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.waveformItem}>
            <VoiceWaveform isSpeaking={isSpeaking.user} color="#0EA5E9" />
            <Text style={styles.waveformLabel}>You</Text>
          </View>
        </View>
      )}

      {isConnecting && (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.connectingText}>Setting up your interview…</Text>
        </View>
      )}

      {status === "live" && (
        <View style={styles.transcriptContainer}>
          <TranscriptPanel turns={transcript} />
        </View>
      )}

      {(status === "saving" || isEnding) && (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.savingText}>Saving and evaluating…</Text>
        </View>
      )}

      {status === "live" && (
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.endButton, isEnding && styles.endButtonDisabled]}
            onPress={handleEnd}
            disabled={isEnding}
          >
            <Text style={styles.endButtonText}>End Interview</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  roleName: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  waveformSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#1E293B",
    marginTop: 1,
  },
  waveformItem: {
    alignItems: "center",
    gap: 10,
  },
  waveformLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: "#334155",
  },
  connectingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  connectingText: {
    color: "#94A3B8",
    fontSize: 15,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    marginTop: 1,
  },
  savingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  savingText: {
    color: "#94A3B8",
    fontSize: 15,
  },
  bottomBar: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  endButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  endButtonDisabled: {
    backgroundColor: "#7F1D1D",
  },
  endButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
