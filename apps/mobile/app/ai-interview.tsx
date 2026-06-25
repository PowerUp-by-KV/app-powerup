import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useSafeBack } from "@/hooks/useSafeBack";

const ROUTE_RESUME = "/resume" as Href;

import { useGetProfileResumeQuery } from "@/services/resume-api";
import { useListInterviewSessionsQuery } from "@/services/interview-playground-api";
import { useWebRTCInterview } from "@/features/interview-playground/hooks/useWebRTCInterview";
import { ConnectionBadge } from "@/features/interview-playground/components/ConnectionBadge";
import type { InterviewSessionSummary } from "@/features/interview-playground/types";

// ---------------------------------------------------------------------------
// Past session card
// ---------------------------------------------------------------------------
function SessionCard({ item, isDark }: { item: InterviewSessionSummary; isDark: boolean }) {
  return (
    <Pressable
      style={[styles.sessionCard, isDark && { backgroundColor: "#1E293B", borderColor: "#334155" }]}
      onPress={() =>
        router.push({
          pathname: "/interview-results",
          params: { session_id: item.session_id, mode: "buddy" },
        })
      }
    >
      <View style={styles.sessionHeader}>
        <Text style={[styles.sessionRole, isDark && { color: "#F8FAFC" }]} numberOfLines={1}>
          {item.derived_role || "Interview"}
        </Text>
        {item.grade && (
          <View style={[styles.gradeBadge, isDark && { backgroundColor: "#312E81" }]}>
            <Text style={[styles.gradeText, isDark && { color: "#A5B4FC" }]}>{item.grade}</Text>
          </View>
        )}
      </View>
      <View style={styles.sessionMeta}>
        <Text style={styles.sessionDate}>{new Date(item.started_at).toLocaleDateString()}</Text>
        {item.final_score !== null && (
          <Text style={styles.sessionScore}>{item.final_score}/100</Text>
        )}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Checklist row
// ---------------------------------------------------------------------------
function CheckRow({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <View style={styles.checkRow}>
      <Feather
        name="check-circle"
        size={16}
        color={isDark ? "#818CF8" : "#4F46E5"}
        style={styles.checkIcon}
      />
      <Text style={[styles.checkLabel, isDark && { color: "#CBD5E1" }]}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function InterviewBuddyScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const goBack = useSafeBack("/");

  const { data: resume, isLoading: isLoadingResume } = useGetProfileResumeQuery();
  const { data: sessions, isLoading: isLoadingSessions } = useListInterviewSessionsQuery({
    mode: "buddy",
  });
  const { startInterview, status, errorMessage } = useWebRTCInterview("buddy");

  const hasResume = !!resume && resume.parse_status === "completed";
  const candidateName = resume?.full_name ?? null;
  const skills: string[] = (resume?.skills ?? [])
    .slice(0, 5)
    .map((s) => (typeof s === "string" ? s : ((s as { name?: string }).name ?? "")))
    .filter(Boolean);
  const isStarting = status === "starting" || status === "connecting";

  const handleStart = useCallback(async () => {
    const sid = await startInterview();
    if (sid) {
      router.push({ pathname: "/interview-room", params: { session_id: sid } });
    }
  }, [startInterview]);

  if (isLoadingResume) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          isDark && { backgroundColor: "#0F172A" },
        ]}
      >
        <ActivityIndicator style={styles.loader} size="large" color="#4F46E5" />
      </View>
    );
  }

  // Resume gate
  if (!hasResume) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          isDark && { backgroundColor: "#0F172A" },
        ]}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={isDark ? "#CBD5E1" : "#475569"} />
          </Pressable>
          <Text style={[styles.title, isDark && { color: "#F8FAFC" }]}>Interview Buddy</Text>
          <View
            style={[styles.gateCard, isDark && { backgroundColor: "#1E293B", shadowOpacity: 0.2 }]}
          >
            <Feather name="file-text" size={48} color={isDark ? "#818CF8" : "#4F46E5"} />
            <Text style={[styles.gateTitle, isDark && { color: "#F8FAFC" }]}>
              Upload your resume first
            </Text>
            <Text style={[styles.gateSub, isDark && { color: "#94A3B8" }]}>
              Interview Buddy tailors every question to your real skills and experience. Upload your
              resume to unlock your mock interview.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.push(ROUTE_RESUME)}>
              <Text style={styles.primaryBtnText}>Go to Resume Studio</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.safe,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        isDark && { backgroundColor: "#0F172A" },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={isDark ? "#CBD5E1" : "#475569"} />
        </Pressable>

        <View style={styles.titleRow}>
          <View style={[styles.iconCircle, isDark && { backgroundColor: "#312E81" }]}>
            <Feather name="user" size={22} color={isDark ? "#A5B4FC" : "#4F46E5"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, isDark && { color: "#F8FAFC" }]}>Interview Buddy</Text>
            <Text style={[styles.subtitle, isDark && { color: "#94A3B8" }]}>
              Full mock interview simulation
            </Text>
          </View>
        </View>

        {/* Candidate card */}
        {candidateName && (
          <View
            style={[
              styles.candidateCard,
              isDark && { backgroundColor: "#1E293B", borderColor: "#334155" },
            ]}
          >
            <Text style={[styles.candidateLabel, isDark && { color: "#64748B" }]}>Candidate</Text>
            <Text style={[styles.candidateName, isDark && { color: "#F8FAFC" }]}>
              {candidateName}
            </Text>
            {skills.length > 0 && (
              <View style={styles.skillsRow}>
                {skills.map((s) => (
                  <View
                    key={s}
                    style={[styles.skillChip, isDark && { backgroundColor: "#312E81" }]}
                  >
                    <Text style={[styles.skillText, isDark && { color: "#A5B4FC" }]}>{s}</Text>
                  </View>
                ))}
                {(resume?.skills?.length ?? 0) > 5 && (
                  <View style={[styles.skillChip, isDark && { backgroundColor: "#312E81" }]}>
                    <Text style={[styles.skillText, isDark && { color: "#A5B4FC" }]}>
                      +{(resume?.skills?.length ?? 0) - 5} more
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* What to expect */}
        <View
          style={[
            styles.expectCard,
            isDark && { backgroundColor: "#1E293B", borderColor: "#334155" },
          ]}
        >
          <Text style={[styles.expectTitle, isDark && { color: "#F8FAFC" }]}>What to expect</Text>
          <CheckRow
            label="6–8 questions across Communication & Behavioral skills"
            isDark={isDark}
          />
          <CheckRow
            label="Formal AI interviewer — no hints or coaching during session"
            isDark={isDark}
          />
          <CheckRow label="Full score breakdown with grade (A–F) at the end" isDark={isDark} />
          <CheckRow
            label="Strengths and improvement areas tailored to your answers"
            isDark={isDark}
          />
        </View>

        {/* Connection status */}
        {status !== "idle" && status !== "done" && (
          <View style={styles.badgeRow}>
            <ConnectionBadge status={status} />
          </View>
        )}

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {/* Start button */}
        <Pressable
          style={[styles.primaryBtn, isStarting && styles.primaryBtnDisabled]}
          onPress={handleStart}
          disabled={isStarting}
        >
          {isStarting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="mic" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Start Interview</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.hint}>
          Make sure your microphone is enabled. The interview will begin immediately.
        </Text>

        {/* Past sessions */}
        {(sessions?.length ?? 0) > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, isDark && { color: "#F8FAFC" }]}>Past Sessions</Text>
            {isLoadingSessions && <ActivityIndicator style={{ marginTop: 12 }} />}
            {(sessions ?? []).map((item) => (
              <SessionCard key={item.session_id} item={item} isDark={isDark} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20, paddingBottom: 60, gap: 16 },
  loader: { marginTop: 80 },
  backBtn: { marginBottom: 4 },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },

  candidateCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
  },
  candidateLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600", textTransform: "uppercase" },
  candidateName: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  skillChip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skillText: { fontSize: 12, color: "#4F46E5", fontWeight: "600" },

  expectCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  expectTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 2 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  checkIcon: { marginTop: 2 },
  checkLabel: { fontSize: 13, color: "#475569", flex: 1, lineHeight: 20 },

  badgeRow: { alignItems: "flex-start" },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 8,
  },

  primaryBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryBtnDisabled: { backgroundColor: "#A5B4FC" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  hint: { fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: -4 },

  gateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  gateTitle: { fontSize: 20, fontWeight: "700", color: "#1E293B", textAlign: "center" },
  gateSub: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 22 },

  historySection: { gap: 10, marginTop: 8 },
  historyTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sessionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sessionRole: { fontSize: 14, fontWeight: "600", color: "#1E293B", flex: 1 },
  gradeBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeText: { color: "#4F46E5", fontSize: 13, fontWeight: "700" },
  sessionMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  sessionDate: { fontSize: 12, color: "#94A3B8" },
  sessionScore: { fontSize: 12, color: "#64748B", fontWeight: "600" },
});
