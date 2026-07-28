import React, { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePipelineInterview } from "../hooks/usePipelineInterview";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { AvatarStage } from "../components/AvatarStage";
import { showAlert } from "@/utils/alert";
import { useSafeBack } from "@/hooks/useSafeBack";

interface PipelineInterviewRoomScreenProps {
  mode?: "buddy" | "playground";
}

export function PipelineInterviewRoomScreen({
  mode = "playground",
}: PipelineInterviewRoomScreenProps) {
  const insets = useSafeAreaInsets();
  const startedRef = useRef(false);
  const goBack = useSafeBack("/");

  const {
    status,
    transcript,
    isSpeaking,
    errorMessage,
    sessionId,
    derivedRole,
    isRecording,
    startInterview,
    endInterview,
  } = usePipelineInterview(mode);

  // Start interview on mount (once)
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      void startInterview();
    }
  }, [startInterview]);

  useEffect(() => {
    if (status === "done" && sessionId) {
      router.replace({
        pathname: "/interview-results",
        params: { session_id: sessionId, mode, transport: "pipeline" },
      });
    } else if (status === "error") {
      const msg = errorMessage ?? "An error occurred.";
      showAlert("Interview Error", msg, [{ text: "OK", onPress: () => goBack() }]);
    }
  }, [status, sessionId, mode, errorMessage, goBack]);

  const handleEnd = useCallback(async () => {
    const runEnd = async () => {
      await endInterview();
    };

    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm("Are you sure you want to end the interview?")
          : true;
      if (confirmed) await runEnd();
      return;
    }

    showAlert("End Interview?", "Are you sure you want to end the interview?", [
      { text: "Cancel", style: "cancel" },
      { text: "End", style: "destructive", onPress: runEnd },
    ]);
  }, [endInterview]);

  const isConnecting = status === "connecting" || status === "starting";
  const isBusy = status === "saving";

  return (
    <View style={styles.safe}>
      <StatusBar style="light" />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#F1F5F9" />
        </Pressable>
        <Text style={styles.roleName} numberOfLines={1}>
          {derivedRole ?? "AI Interview"}
        </Text>
        <ConnectionBadge status={status} />
      </View>

      {(isConnecting || status === "live") && (
        <AvatarStage
          aiSpeaking={isSpeaking.ai}
          userSpeaking={isSpeaking.user || isRecording}
          subtitle={derivedRole ?? undefined}
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
          <Pressable style={styles.endButtonFull} onPress={handleEnd}>
            <Text style={styles.endButtonText}>End Interview</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0F172A" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  backBtn: {
    paddingRight: 12,
    paddingVertical: 4,
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
  centerText: { color: "#94A3B8", fontSize: 15 },
  transcriptContainer: { flex: 1, backgroundColor: "#0F172A" },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  endButtonFull: {
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  endButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
