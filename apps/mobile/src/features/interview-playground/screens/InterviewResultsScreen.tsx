import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetInterviewSessionQuery } from "@/services/interview-playground-api";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import { SessionInsights } from "../components/SessionInsights";
import { TranscriptPanel } from "../components/TranscriptPanel";

interface InterviewResultsScreenProps {
  sessionId: string | undefined;
  mode?: "buddy" | "playground";
}

export function InterviewResultsScreen({
  sessionId,
  mode = "playground",
}: InterviewResultsScreenProps) {
  const homeRoute = mode === "buddy" ? "/ai-interview" : "/interview-playground";
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    data: session,
    isLoading,
    isError,
  } = useGetInterviewSessionQuery(sessionId ?? "", {
    skip: !sessionId,
  });

  if (!sessionId) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, paddingBottom: insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.center}>
          <Text style={styles.errorText}>No session ID provided.</Text>
          <Pressable style={styles.backButton} onPress={() => router.push(homeRoute as never)}>
            <Text style={styles.backButtonText}>Back to Interviews</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, paddingBottom: insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading results…</Text>
        </View>
      </View>
    );
  }

  if (isError || !session) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, paddingBottom: insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load session results.</Text>
          <Pressable style={styles.backButton} onPress={() => router.push(homeRoute as never)}>
            <Text style={styles.backButtonText}>Back to Interviews</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const hasEvaluation = !!session.evaluation;

  return (
    <View
      style={[
        styles.safe,
        { paddingTop: insets.top, paddingBottom: insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.topBar}>
        <Text style={styles.title} numberOfLines={1}>
          {mode === "buddy" ? (session.derived_role ?? "Interview Results") : "Practice Session"}
        </Text>
        <Text style={styles.date}>{new Date(session.started_at).toLocaleDateString()}</Text>
      </View>

      <View style={styles.body}>
        {hasEvaluation ? (
          // Buddy = formal scored rubric. Playground = low-pressure recap, no grade.
          mode === "buddy" ? (
            <ScoreBreakdown evaluation={session.evaluation!} />
          ) : (
            <SessionInsights evaluation={session.evaluation!} />
          )
        ) : (
          <View style={styles.noEvalContainer}>
            <Text style={styles.noEvalText}>
              Evaluation is still being processed or was not available.
            </Text>
          </View>
        )}

        {session.transcript.length > 0 && (
          <View style={styles.transcriptSection}>
            <Pressable
              style={styles.transcriptToggle}
              onPress={() => setIsTranscriptExpanded((prev) => !prev)}
            >
              <Text style={styles.transcriptToggleText}>
                {isTranscriptExpanded ? "Hide Transcript" : "Show Transcript"}
              </Text>
            </Pressable>

            {isTranscriptExpanded && (
              <View style={styles.transcriptBox}>
                <TranscriptPanel turns={session.transcript} />
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.footerButton, styles.secondaryButton]}
          onPress={() => router.push(homeRoute as never)}
        >
          <Text style={styles.secondaryButtonText}>
            {mode === "buddy" ? "Back to Buddy" : "View History"}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.footerButton, styles.primaryButton]}
          onPress={() => router.replace(homeRoute as never)}
        >
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 12,
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
  },
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  noEvalContainer: {
    padding: 24,
    alignItems: "center",
  },
  noEvalText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
  transcriptSection: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
  },
  transcriptToggle: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
  },
  transcriptToggleText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "600",
  },
  transcriptBox: {
    height: 240,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: "#EEF2FF",
  },
  secondaryButtonText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: 15,
  },
});
