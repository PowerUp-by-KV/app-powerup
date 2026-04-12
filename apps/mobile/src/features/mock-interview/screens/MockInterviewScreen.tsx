/**
 * src/features/mock-interview/screens/MockInterviewScreen.tsx
 *
 * Real API flow (one question at a time):
 *   1. POST /interviews/sessions   → { session_id, current_question }
 *   2. POST /sessions/{id}/answer  → { session_complete, next_question, transcription, confidence_score }
 *   3. Repeat step 2 until session_complete = true
 *   4. Navigate to result screen with sessionId
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Waveform } from "@/components/Waveform";
import { useRealtimeWaveform } from "@/hooks/useRealtimeWaveform";
import { logger } from "@/utils/logger";
import { useAppSelector } from "@/store/hooks";
import {
  useStartInterviewSessionMutation,
  useSubmitMockInterviewAudioMutation,
  type InterviewQuestion,
} from "@/services/mockInterviewApiSlice";

const IS_WEB = Platform.OS === "web";
const ORB_OUTER = IS_WEB ? 310 : 240;
const ORB_INNER = IS_WEB ? 278 : 212;
const WAVEFORM_W = IS_WEB ? 176 : 140;
const WAVEFORM_H = IS_WEB ? 84 : 66;

interface SimulatedIndicators {
  speakingPace: number;
  clarity: number;
  fillerCount: number;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerText: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginTop: 8 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 16 },
  questionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: { fontSize: 16, fontWeight: "600", color: "#1f2937", marginBottom: 8 },
  questionNumber: { fontSize: 12, color: "#9ca3af", marginBottom: 8 },
  timerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: { fontSize: 14, color: "#374151", marginLeft: 8, fontWeight: "500" },
  indicatorsContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  indicatorTitle: { color: "#ffffff", fontSize: 12, fontWeight: "600", marginBottom: 12 },
  indicatorRow: { marginBottom: 12 },
  indicatorLabel: { color: "#9ca3af", fontSize: 11, fontWeight: "500", marginBottom: 4 },
  indicatorValue: { color: "#ffffff", fontSize: 11, fontWeight: "600" },
  progressBar: {
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: { height: "100%", backgroundColor: "#3b82f6" },
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    marginBottom: 24,
  },
  orbOuter: {
    width: ORB_OUTER,
    height: ORB_OUTER,
    borderRadius: ORB_OUTER / 2,
    backgroundColor: "rgba(15,23,42,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  orbInner: {
    width: ORB_INNER,
    height: ORB_INNER,
    borderRadius: ORB_INNER / 2,
    backgroundColor: "#071433",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    overflow: "hidden",
  },
  orbText: { color: "#ffffff", fontSize: 14, fontWeight: "bold", letterSpacing: 0.5 },
  orbSubtext: { color: "#d1d5db", fontSize: 11, marginTop: 4 },
  waveformContainer: {
    width: WAVEFORM_W,
    height: WAVEFORM_H,
    overflow: "hidden",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -35,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonContainer: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  button: { height: 48, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  recordedBadge: {
    backgroundColor: "#dcfce7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  recordedBadgeText: { fontSize: 11, color: "#166534", fontWeight: "600" },
});

export function MockInterviewScreen() {
  const router = useRouter();
  const profileCandidateId = useAppSelector((s) => s.profile.candidateId);
  const candidateId = profileCandidateId || "";

  const { isRecording, bars, start, stop } = useRealtimeWaveform();

  const [triggerStartSession] = useStartInterviewSessionMutation();
  const [triggerSubmitAnswer] = useSubmitMockInterviewAudioMutation();

  // ── Session state ──────────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1); // 1-based counter
  const [pendingAudioUri, setPendingAudioUri] = useState<string | null>(null); // recorded but not yet submitted
  const [seconds, setSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indicators, setIndicators] = useState<SimulatedIndicators>({
    speakingPace: 0,
    clarity: 0,
    fillerCount: 0,
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);
  const indicatorInterval = useRef<NodeJS.Timeout | null>(null);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    initializeSession();
    return () => {
      mountedRef.current = false;
      Speech.stop();
      if (indicatorInterval.current) clearInterval(indicatorInterval.current);
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.38, duration: 650, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.14, duration: 650, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) return;
    const update = () =>
      setIndicators({
        speakingPace: Math.round(100 + Math.random() * 100),
        clarity: Math.round(50 + Math.random() * 50),
        fillerCount: Math.floor(Math.random() * 5),
      });
    update();
    indicatorInterval.current = setInterval(update, 1500);
    return () => {
      if (indicatorInterval.current) clearInterval(indicatorInterval.current);
    };
  }, [isRecording]);

  // ── Session init ───────────────────────────────────────────────────────────

  const initializeSession = async () => {
    try {
      if (!candidateId) throw new Error("Candidate ID missing. Please upload your resume first.");

      const result = await triggerStartSession({ candidateId });
      if (result.error || !result.data) throw new Error("Failed to start interview session.");

      if (!mountedRef.current) return;

      const { sessionId: sid, currentQuestion: firstQ } = result.data;
      setSessionId(sid);
      setCurrentQuestion(firstQ);
      setQuestionNumber(1);
      setIsLoading(false);

      if (firstQ?.text) await speakTextAsync(firstQ.text);
    } catch (error) {
      logger.log("Init error:", error);
      if (!mountedRef.current) return;
      setIsLoading(false);
      Alert.alert("Error", (error as Error)?.message || "Could not start session.");
    }
  };

  // ── TTS helper ─────────────────────────────────────────────────────────────

  const speakTextAsync = (text: string): Promise<void> =>
    new Promise((resolve) => {
      if (!text?.trim()) return resolve();
      Speech.stop();
      if (mountedRef.current) setIsSpeaking(true);
      Speech.speak(text, {
        language: "en-US",
        rate: 0.95,
        pitch: 1.0,
        onDone: () => {
          if (mountedRef.current) setIsSpeaking(false);
          resolve();
        },
        onError: () => {
          if (mountedRef.current) setIsSpeaking(false);
          resolve();
        },
      });
    });

  // ── Mic handler ────────────────────────────────────────────────────────────

  const handleMicPress = async () => {
    if (isSpeaking || isSubmitting) return;
    try {
      if (!isRecording) {
        setSeconds(0);
        setPendingAudioUri(null);
        await start();
      } else {
        const audioUri = await stop();
        if (!audioUri) throw new Error("No audio recorded.");
        setPendingAudioUri(audioUri);
      }
    } catch (error) {
      logger.log("Mic error:", error);
      if (!mountedRef.current) return;
      Alert.alert("Recording Error", (error as Error)?.message || "Recording failed.");
    }
  };

  // ── Submit current answer → get next question ─────────────────────────────

  const handleSubmitAndNext = async () => {
    if (!pendingAudioUri || !sessionId || !currentQuestion) {
      Alert.alert("No Recording", "Please record your answer before continuing.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await triggerSubmitAnswer({
        sessionId,
        questionId: currentQuestion.id,
        audioUri: pendingAudioUri,
      });

      if (!mountedRef.current) return;

      if (result.error) {
        throw new Error("Failed to submit answer. Please try again.");
      }

      const { sessionComplete, nextQuestion } = result.data!;

      if (sessionComplete || !nextQuestion) {
        // ── Interview complete → navigate to result/feedback screen ──────────
        router.push({
          pathname: "/interview/report",
          params: { reportId: sessionId },
        } as never);
        return;
      }

      // ── Show next question ─────────────────────────────────────────────────
      setPendingAudioUri(null);
      setCurrentQuestion(nextQuestion);
      setQuestionNumber((n) => n + 1);
      setSeconds(0);
      setIsSubmitting(false);

      if (nextQuestion.text) await speakTextAsync(nextQuestion.text);
    } catch (error) {
      logger.log("Submit error:", error);
      if (!mountedRef.current) return;
      setIsSubmitting(false);
      Alert.alert("Error", (error as Error)?.message || "Failed to submit answer.");
    }
  };

  const handleReplay = async () => {
    if (!currentQuestion?.text || isRecording || isSpeaking) return;
    await speakTextAsync(currentQuestion.text);
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ color: "#6b7280", marginTop: 16 }}>Starting interview...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
        >
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={[styles.title, { marginTop: 16 }]}>No Question Loaded</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.button,
              { backgroundColor: "#2563eb", marginTop: 24, paddingHorizontal: 24 },
            ]}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Mock Interview • Question {questionNumber}</Text>
          <Text style={styles.title}>Practice Session</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Question Card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {questionNumber}</Text>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>

            {pendingAudioUri && (
              <View style={styles.recordedBadge}>
                <Text style={styles.recordedBadgeText}>✓ Answer recorded</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleReplay}
              disabled={isRecording || isSpeaking}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: "#2563eb", fontSize: 12, fontWeight: "600" }}>
                🔊 Replay Question
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons name="clock" size={16} color="#1f2937" />
            <Text style={styles.timerText}>{formattedTime}</Text>
          </View>

          {/* Live Indicators */}
          {isRecording && (
            <View style={styles.indicatorsContainer}>
              <Text style={styles.indicatorTitle}>Live Metrics</Text>

              <View style={styles.indicatorRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.indicatorLabel}>Speaking Pace</Text>
                  <Text style={styles.indicatorValue}>{indicators.speakingPace} WPM</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min((indicators.speakingPace / 200) * 100, 100)}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.indicatorRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.indicatorLabel}>Clarity</Text>
                  <Text style={styles.indicatorValue}>{indicators.clarity}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${indicators.clarity}%` }]} />
                </View>
              </View>

              <View style={styles.indicatorRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.indicatorLabel}>Filler Words</Text>
                  <Text style={styles.indicatorValue}>{indicators.fillerCount}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.max(0, 100 - indicators.fillerCount * 20)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Mic Orb */}
          <View style={styles.orbContainer}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.orbOuter,
                {
                  width: ORB_OUTER + 30,
                  height: ORB_OUTER + 30,
                  borderRadius: (ORB_OUTER + 30) / 2,
                  backgroundColor: "#2563eb",
                  opacity: glowAnim,
                  transform: [{ scale: pulseAnim }],
                  position: "absolute",
                },
              ]}
            />

            <View style={styles.orbOuter}>
              <View style={styles.orbInner}>
                <Text style={styles.orbText}>Voice Response</Text>
                <Text style={styles.orbSubtext}>
                  {isRecording ? "Listening..." : isSpeaking ? "Speaking..." : "Tap to speak"}
                </Text>
                <View style={styles.waveformContainer}>
                  <Waveform bars={bars} />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.micButton, { backgroundColor: isRecording ? "#dc2626" : "#2563eb" }]}
                onPress={handleMicPress}
                disabled={isSpeaking || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <MaterialCommunityIcons
                    name={isRecording ? "stop" : "microphone"}
                    size={28}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSubmitAndNext}
            disabled={!pendingAudioUri || isSubmitting}
            style={[styles.button, { backgroundColor: pendingAudioUri ? "#2563eb" : "#d1d5db" }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {pendingAudioUri ? "Submit & Continue →" : "Record your answer first"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.button, { backgroundColor: "#e5e7eb" }]}
          >
            <Text style={[styles.buttonText, { color: "#374151" }]}>Exit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
