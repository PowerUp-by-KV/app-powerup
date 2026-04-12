/**
 * src/features/interview/screens/InterviewScreen.tsx
 * 
 * Interview Coach Screen - FULL WIDTH, MOCK INTERVIEW STYLE
 * - Full width layout (NOT centered)
 * - Question card, timer, live indicators, mic UI
 * - Single-screen flow: questions load sequentially
 * - Live indicators poll API every 1.5s during recording
 * - FIXED: Waveform orbit perfectly centered
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Waveform } from "@/components/Waveform";
import { useRealtimeWaveform } from "@/hooks/useRealtimeWaveform";
import { logger } from "@/utils/logger";
import { useAppSelector } from "@/store/hooks";
import {
  useLazyStartPracticeQuestionQuery,
  useSubmitPracticeAnswerMutation,
} from "@/services/practiceApiSlice";
import {
  useLazyGetLiveIndicatorsQuery,
} from "@/features/interview/services/interviewFeedbackApi";
import type { LiveIndicators } from "../types/interview.types";

const IS_WEB = Platform.OS === "web";
const ORB_OUTER = IS_WEB ? 310 : 240;
const ORB_INNER = IS_WEB ? 278 : 212;
const WAVEFORM_W = IS_WEB ? 176 : 140;
const WAVEFORM_H = IS_WEB ? 84 : 66;

const INITIAL_INDICATORS: LiveIndicators = {
  speakingPace: 0,
  clarity: 0,
  fillerCount: 0,
  confidence: 0,
  timestamp: Date.now(),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
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
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
  },
  timerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    fontWeight: "500",
  },
  indicatorsContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  indicatorTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },
  indicatorRow: {
    marginBottom: 12,
  },
  indicatorLabel: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 4,
  },
  indicatorValue: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    marginBottom: 24,
    width: "100%",
  },
  orbWrapper: {
    width: ORB_OUTER,
    height: ORB_OUTER,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  orbGlow: {
    position: "absolute",
    width: ORB_OUTER + 40,
    height: ORB_OUTER + 40,
    borderRadius: (ORB_OUTER + 40) / 2,
    backgroundColor: "#2563eb",
  },
  orbOuter: {
    width: ORB_OUTER,
    height: ORB_OUTER,
    borderRadius: ORB_OUTER / 2,
    backgroundColor: "rgba(15,23,42,0.06)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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
  orbText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  orbSubtext: {
    color: "#d1d5db",
    fontSize: 11,
    marginTop: 4,
  },
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
    zIndex: 2,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export function InterviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  
  const profileCandidateId = useAppSelector((s) => s.profile.candidateId);
  const candidateId = profileCandidateId || params?.candidateId || "";
  const sessionTitle = params?.sessionTitle || "Interview Coach";

  const { isRecording, bars, start, stop } = useRealtimeWaveform();

  const [triggerStartQuestion] = useLazyStartPracticeQuestionQuery();
  const [triggerSubmitAnswer] = useSubmitPracticeAnswerMutation();
  const [triggerGetLiveIndicators] = useLazyGetLiveIndicatorsQuery();

  const [questionIndex, setQuestionIndex] = useState(1);
  const [questionId, setQuestionId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [statusText, setStatusText] = useState("Loading first question...");
  const [sessionId, setSessionId] = useState("");
  const [indicators, setIndicators] = useState<LiveIndicators>(INITIAL_INDICATORS);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session
  useEffect(() => {
    mountedRef.current = true;
    initializeSession();

    return () => {
      mountedRef.current = false;
      Speech.stop();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // Animation
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
  }, [isRecording, glowAnim, pulseAnim]);

  // Live indicators polling - ONLY while recording
  useEffect(() => {
    if (!isRecording || !sessionId || !questionId) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const pollIndicators = async () => {
      try {
        const result = await triggerGetLiveIndicators({
          sessionId,
          questionId,
        });
        if (result.data && mountedRef.current) {
          setIndicators(result.data);
        }
      } catch (error) {
        logger.log("Error polling indicators:", error);
      }
    };

    // Poll immediately, then every 1.5 seconds
    pollIndicators();
    pollIntervalRef.current = setInterval(pollIndicators, 1500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isRecording, sessionId, questionId, triggerGetLiveIndicators]);

  const initializeSession = async () => {
    try {
      if (!candidateId) throw new Error("Candidate ID missing");

      setStatusText("Loading first question...");
      const result = await triggerStartQuestion({ userId: candidateId });
      if (result.error) throw new Error("Failed to load first question");

      if (!mountedRef.current) return;

      const question = result.data;
      if (!question) throw new Error("No question returned");
      
      setQuestionId(question.id || "");
      setQuestionText(question.text || "");
      setSessionId(`session-${Date.now()}`);
      setQuestionIndex(1);
      setTotalQuestions(1);
      setStatusText("Tap the mic to start answering.");

      if (question.text) {
        await speakTextAsync(question.text);
      }
    } catch (error) {
      logger.log("Init error, using mock data fallback:", error);
      if (!mountedRef.current) return;
      
      // Mock data fallback
      const mockQ = { id: "mock-1", text: "Mock Data: Can you describe a challenging project you've worked on recently?" };
      setQuestionId(mockQ.id);
      setQuestionText(mockQ.text);
      setSessionId(`session-${Date.now()}`);
      setQuestionIndex(1);
      setTotalQuestions(1);
      setStatusText("Tap the mic to start answering.");
      
      await speakTextAsync(mockQ.text);
    }
  };

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

  const handleMicPress = async () => {
    if (isSpeaking || isLoadingNext) return;

    try {
      if (!isRecording) {
        setSeconds(0);
        setStatusText("Starting recording...");
        await start();
        if (mountedRef.current) setStatusText("Recording...");
      } else {
        setStatusText("Processing answer...");
        setIsLoadingNext(true);
        
        // Stop polling immediately
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        const audioUri = await stop();
        if (!audioUri) throw new Error("No recording");

        await handleBackendFlow(audioUri);
      }
    } catch (error) {
      logger.log("Mic error:", error);
      if (!mountedRef.current) return;
      setIsLoadingNext(false);
      Alert.alert("Error", (error as Error)?.message || "Microphone error");
    }
  };

  const handleBackendFlow = async (audioUri: string) => {
    try {
      if (!questionId) throw new Error("Question ID missing");

      setStatusText("Submitting answer...");
      const result = await triggerSubmitAnswer({
        audioUri,
        userId: candidateId,
        questionId,
      });

      if (result.error) throw new Error("Failed to submit");

      if (!mountedRef.current) return;

      // Navigate to feedback - ONLY pass necessary params (no large objects)
      router.push({
        pathname: "/interview/feedback",
        params: {
          sessionId,
          questionId,
          questionText,
        },
      });
    } catch (error) {
      logger.log("Backend error:", error);
      if (!mountedRef.current) return;
      setIsLoadingNext(false);
      Alert.alert("Error", (error as Error)?.message || "Failed to process");
    }
  };

  const handleReplay = async () => {
    if (!questionText || isRecording || isLoadingNext || isSpeaking) return;
    await speakTextAsync(questionText);
  };

  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [seconds]);

  const assistantStateText = isRecording
    ? "Listening..."
    : isSpeaking
      ? "Speaking..."
      : isLoadingNext
        ? "Processing..."
        : "Tap to speak";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Interview Coach • Q {questionIndex} of {totalQuestions}</Text>
          <Text style={styles.title}>{sessionTitle}</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Question Card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {questionIndex}</Text>
            <Text style={styles.questionText}>{questionText || "Loading..."}</Text>
            <TouchableOpacity
              onPress={handleReplay}
              disabled={isRecording || isLoadingNext || isSpeaking}
              style={{ marginTop: 8 }}
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

          {/* Live Indicators - ONLY show while recording */}
          {isRecording && (
            <View style={styles.indicatorsContainer}>
              <Text style={styles.indicatorTitle}>Live Metrics</Text>

              {/* Speaking Pace */}
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

              {/* Clarity */}
              <View style={styles.indicatorRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.indicatorLabel}>Clarity</Text>
                  <Text style={styles.indicatorValue}>{indicators.clarity}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${indicators.clarity}%` }]}
                  />
                </View>
              </View>

              {/* Filler Words */}
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

          {/* Mic Orb - FIXED ALIGNMENT */}
          <View style={styles.orbContainer}>
            <View style={styles.orbWrapper}>
              {/* Glow behind orbit */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.orbGlow,
                  {
                    opacity: glowAnim,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />

              {/* Outer orbit circle */}
              <View style={styles.orbOuter}>
                {/* Inner circle */}
                <View style={styles.orbInner}>
                  <Text style={styles.orbText}>Voice Response</Text>
                  <Text style={styles.orbSubtext}>{assistantStateText}</Text>

                  {/* Waveform */}
                  <View style={styles.waveformContainer}>
                    <Waveform bars={bars} />
                  </View>
                </View>
              </View>

              {/* Mic button - centered at bottom */}
              <TouchableOpacity
                style={[
                  styles.micButton,
                  { backgroundColor: isRecording ? "#dc2626" : "#2563eb" },
                ]}
                onPress={handleMicPress}
                disabled={isSpeaking || isLoadingNext}
              >
                {isLoadingNext ? (
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
            onPress={handleMicPress}
            disabled={isSpeaking || isLoadingNext}
            style={[
              styles.button,
              {
                backgroundColor: isLoadingNext ? "#d1d5db" : "#2563eb",
              },
            ]}
          >
            <Text style={styles.buttonText}>
              {isRecording ? "Stop Recording" : "Next Question"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/interview-sessions")}
            style={[styles.button, { backgroundColor: "#e5e7eb" }]}
          >
            <Text style={[styles.buttonText, { color: "#374151" }]}>Exit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
