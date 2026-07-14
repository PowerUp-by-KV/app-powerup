import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useSafeBack } from "@/hooks/useSafeBack";
import type { InterviewStatus, TranscriptTurn } from "../types";
import {
  activeSession,
  onSpeakingChange,
  onStatusChange,
  onTranscriptChange,
  resetSession,
} from "../store/interviewSession";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { AvatarStage } from "../components/AvatarStage";
import { useWebRTCInterview } from "../hooks/useWebRTCInterview";
import { showAlert } from "@/utils/alert";

interface InterviewRoomScreenProps {
  sessionId: string | undefined;
  mode?: "buddy" | "playground";
}

export function InterviewRoomScreen({ sessionId, mode = "playground" }: InterviewRoomScreenProps) {
  const insets = useSafeAreaInsets();
  const [status, setLocalStatus] = useState<InterviewStatus>(activeSession.status);
  const [transcript, setLocalTranscript] = useState<TranscriptTurn[]>(activeSession.transcript);
  const [isSpeaking, setLocalSpeaking] = useState(activeSession.isSpeaking);
  const [isEnding, setIsEnding] = useState(false);
  const goBack = useSafeBack("/");

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
      const msg = activeSession.errorMessage ?? "An error occurred.";
      showAlert("Interview Error", msg, [{ text: "OK", onPress: () => router.back() }]);
    }
  }, [status, sessionId, mode]);

  // Safety net: if the user leaves the room without ending (back gesture,
  // navigating away), tear down the WebRTC connection and stop the mic so we
  // don't leak the peer connection or leave the microphone recording.
  useEffect(() => {
    return () => {
      if (activeSession.status === "live" || activeSession.status === "connecting") {
        resetSession();
      }
    };
  }, []);

  const handleEnd = useCallback(async () => {
    if (isEnding) return;

    const runEnd = async () => {
      setIsEnding(true);
      await endInterview();
      setIsEnding(false);
    };

    showAlert("End Interview?", "Are you sure you want to end the interview?", [
      { text: "Cancel", style: "cancel" },
      { text: "End", style: "destructive", onPress: runEnd },
    ]);
  }, [endInterview, isEnding]);

  const isConnecting = status === "connecting" || status === "starting";
  const isBusy = status === "saving" || isEnding;

  return (
    <View style={styles.safe}>
      <StatusBar style="light" />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={goBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.05)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.roleName} numberOfLines={1}>
          {activeSession.derivedRole ?? "AI Interview"}
        </Text>
        <ConnectionBadge status={status} />
      </View>

      {(isConnecting || status === "live") && (
        <AvatarStage
          aiSpeaking={isSpeaking.ai}
          userSpeaking={isSpeaking.user}
          subtitle={activeSession.derivedRole ?? undefined}
        />
      )}

      {isConnecting && (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#818CF8" />
          <Text style={styles.centerText}>Preparing your interview…</Text>
        </View>
      )}

      {status === "live" && (
        <View style={styles.transcriptContainer}>
          <TranscriptPanel turns={transcript} />
        </View>
      )}

      {isBusy && (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#818CF8" />
          <Text style={styles.centerText}>Saving and evaluating…</Text>
        </View>
      )}

      {status === "live" && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={[styles.endButton, isEnding && styles.endButtonDisabled]}
            onPress={handleEnd}
            disabled={isEnding}
          >
            <Text style={styles.endButtonText}>End Interview</Text>
          </Pressable>
        </View>
      )}
    </View>
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
    paddingBottom: 14,
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
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  centerText: {
    color: "#94A3B8",
    fontSize: 15,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  endButton: {
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 16,
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
