import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useListInterviewSessionsQuery } from "@/services/interview-playground-api";
import { useGetProfileResumeQuery } from "@/services/resume-api";
import { usePlanTier } from "@/hooks/usePlanTier";
import type { InterviewSessionSummary } from "../types";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { useWebRTCInterview } from "../hooks/useWebRTCInterview";
import { PaywallScreen } from "@/features/subscription/PaywallScreen";

function SessionItem({ item }: { item: InterviewSessionSummary }) {
  const handlePress = () => {
    router.push({
      pathname: "/interview-results",
      params: { session_id: item.session_id, mode: "playground" },
    });
  };

  return (
    <Pressable style={styles.sessionCard} onPress={handlePress}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionRole} numberOfLines={1}>
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

// Wrapper: handles tier routing internally so each hook can be conditionally used
function WebRTCEntry() {
  const insets = useSafeAreaInsets();
  const { data: sessions, isLoading: isLoadingSessions } = useListInterviewSessionsQuery({
    mode: "playground",
  });
  const { data: resume, isLoading: isLoadingResume } = useGetProfileResumeQuery();
  const { startInterview, status, errorMessage } = useWebRTCInterview();

  const isStarting = status === "starting" || status === "connecting";
  const hasResume = !!resume && resume.parse_status === "completed";

  const handleStart = useCallback(async () => {
    const sid = await startInterview();
    if (sid) {
      router.push({ pathname: "/interview-room", params: { session_id: sid, mode: "playground" } });
    }
  }, [startInterview]);

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Interview Playground</Text>
          <Text style={styles.subtitle}>Practice your interview with an AI interviewer</Text>

          {status !== "idle" && status !== "done" && (
            <View style={styles.badgeRow}>
              <ConnectionBadge status={status} />
            </View>
          )}

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {!hasResume && !isLoadingResume && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Upload your resume first so we can tailor the interview to your profile.
              </Text>
              <Pressable onPress={() => router.push("/resume")} style={styles.resumeLink}>
                <Text style={styles.resumeLinkText}>Go to Resume</Text>
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

          {(sessions?.length ?? 0) > 0 && <Text style={styles.historyTitle}>Past Sessions</Text>}
        </View>

        {isLoadingSessions && <ActivityIndicator style={styles.loader} />}
        {(sessions ?? []).map((item) => (
          <SessionItem key={item.session_id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

function PipelineEntry() {
  const insets = useSafeAreaInsets();
  const { data: resume, isLoading: isLoadingResume } = useGetProfileResumeQuery();

  const hasResume = !!resume && resume.parse_status === "completed";

  const handleStart = useCallback(() => {
    router.push({
      pathname: "/pipeline-interview-room" as never,
      params: { mode: "playground" },
    });
  }, []);

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Interview Playground</Text>
          <Text style={styles.subtitle}>Practice your interview with an AI interviewer</Text>

          {!hasResume && !isLoadingResume && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Upload your resume first so we can tailor the interview to your profile.
              </Text>
              <Pressable onPress={() => router.push("/resume")} style={styles.resumeLink}>
                <Text style={styles.resumeLinkText}>Go to Resume</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={[styles.startButton, !hasResume && styles.startButtonDisabled]}
            onPress={handleStart}
            disabled={!hasResume}
          >
            <Text style={styles.startButtonText}>Start Interview</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export function InterviewEntryScreen() {
  const tier = usePlanTier();

  if (tier === "free") {
    return (
      <PaywallScreen
        requiredTier="pro"
        featureName="Interview Playground"
        onBack={() => router.back()}
      />
    );
  }

  if (tier === "pro") {
    return <PipelineEntry />;
  }

  // premium
  return <WebRTCEntry />;
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
  sessionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: "#94A3B8",
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
