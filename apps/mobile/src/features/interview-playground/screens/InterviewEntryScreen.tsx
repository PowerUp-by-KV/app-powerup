import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useSafeBack } from "@/hooks/useSafeBack";
import { useListInterviewSessionsQuery } from "@/services/interview-playground-api";
import { useGetProfileResumeQuery } from "@/services/resume-api";
import type { InterviewSessionSummary } from "../types";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { useWebRTCInterview } from "../hooks/useWebRTCInterview";
import { useColorScheme } from "nativewind";

function SessionItem({ item }: { item: InterviewSessionSummary }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePress = () => {
    router.push({
      pathname: "/interview-results",
      params: { session_id: item.session_id, mode: "playground" },
    });
  };

  return (
    <Pressable
      style={[styles.sessionCard, isDark && { backgroundColor: "#1E293B", shadowOpacity: 0.2 }]}
      onPress={handlePress}
    >
      <View style={styles.sessionHeader}>
        <Text style={[styles.sessionRole, isDark && { color: "#F8FAFC" }]} numberOfLines={1}>
          {item.derived_role || "Practice Session"}
        </Text>
      </View>
      <View style={styles.sessionMeta}>
        <Text style={styles.sessionDate}>{new Date(item.started_at).toLocaleDateString()}</Text>
        <Text style={styles.sessionRecapHint}>View recap →</Text>
      </View>
    </Pressable>
  );
}

export function InterviewEntryScreen() {
  const insets = useSafeAreaInsets();
  const { data: sessions, isLoading: isLoadingSessions } = useListInterviewSessionsQuery({
    mode: "playground",
  });
  const { data: resume, isLoading: isLoadingResume } = useGetProfileResumeQuery();
  const { startInterview, status, errorMessage } = useWebRTCInterview();

  const isStarting = status === "starting" || status === "connecting";
  const hasResume = !!resume && resume.parse_status === "completed";
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const goBack = useSafeBack("/");

  const handleStart = useCallback(async () => {
    const sid = await startInterview();
    if (sid) {
      router.push({ pathname: "/interview-room", params: { session_id: sid, mode: "playground" } });
    }
  }, [startInterview]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable
          onPress={goBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? "#fff" : "#0F172A"} />
        </Pressable>
        <Text style={[styles.title, isDark && { color: "#F8FAFC" }]}>Interview Playground</Text>
      </View>
      <Text style={[styles.subtitle, isDark && { color: "#94A3B8" }]}>
        Practice your interview with an AI interviewer
      </Text>

      {status !== "idle" && status !== "done" && (
        <View style={styles.badgeRow}>
          <ConnectionBadge status={status} />
        </View>
      )}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {!hasResume && !isLoadingResume && (
        <View style={[styles.warningBox, isDark && { backgroundColor: "#431407" }]}>
          <Text style={[styles.warningText, isDark && { color: "#FDBA74" }]}>
            Upload your resume first so we can tailor the interview to your profile.
          </Text>
          <Pressable onPress={() => router.push("/resume")} style={styles.resumeLink}>
            <Text style={[styles.resumeLinkText, isDark && { color: "#818CF8" }]}>
              Go to Resume
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={[styles.startButton, (!hasResume || isStarting) && styles.startButtonDisabled]}
        onPress={handleStart}
        disabled={!hasResume || isStarting}
      >
        {isStarting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>Start Interview</Text>
        )}
      </Pressable>

      {(sessions?.length ?? 0) > 0 && (
        <Text style={[styles.historyTitle, isDark && { color: "#F8FAFC" }]}>Past Sessions</Text>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.safe,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        isDark && { backgroundColor: "#0F172A" },
      ]}
    >
      <ScrollView contentContainerStyle={styles.listContent}>
        {renderHeader()}
        {isLoadingSessions && <ActivityIndicator style={styles.loader} />}
        {(sessions ?? []).map((item) => (
          <SessionItem key={item.session_id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  badgeRow: {
    marginTop: 4,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 8,
  },
  warningBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  warningText: {
    color: "#92400E",
    fontSize: 13,
  },
  resumeLink: {
    alignSelf: "flex-start",
  },
  resumeLinkText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  startButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  startButtonDisabled: {
    backgroundColor: "#A5B4FC",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
  },
  sessionCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionRole: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  gradeBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "700",
  },
  sessionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
  sessionScore: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  sessionRecapHint: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600",
  },
  loader: {
    marginTop: 40,
  },
});
