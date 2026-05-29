import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const SCREEN_TITLE = "Convo Coach";
const ROUTE_FEEDBACK = "/mock-interview/feedback" as Href;
const ROUTE_RESULT = "/mock-interview/result" as Href;
const ROUTE_HOME = "/(tabs)" as Href;
import { useAppSelector } from "@/store/hooks";
import { useGetNextQuestionQuery, useSubmitAnswerMutation } from "@/services/mock-interview-api";
import type { SubmitAnswerResponse } from "@/services/mock-interview-api";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";

// ---------------------------------------------------------------------------
// Score circle — drawn purely with Views (no SVG dependency)
// ---------------------------------------------------------------------------

function ScoreCircle({ pct, label }: { pct: number; label: string }) {
  const radius = 36;
  const stroke = 5;
  const normalised = Math.min(100, Math.max(0, pct));
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(spinAnim, {
      toValue: normalised / 100,
      duration: 800,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalised]);

  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <View
        style={{
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          borderWidth: stroke,
          borderColor: "#e2e8f0",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Animated arc — rotates spinAnim (0→1) via interpolate */}
        <Animated.View
          style={{
            position: "absolute",
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            borderWidth: stroke,
            borderColor: "#3b82f6",
            borderRightColor: normalised > 25 ? "#3b82f6" : "transparent",
            borderTopColor: normalised > 50 ? "#3b82f6" : "transparent",
            borderLeftColor: normalised > 75 ? "#3b82f6" : "transparent",
            transform: [
              {
                rotate: spinAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          }}
        />
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#1e293b" }}>{pct}%</Text>
      </View>
      <Text
        style={{
          fontSize: 11,
          color: "#64748b",
          marginTop: 6,
          textAlign: "center",
          lineHeight: 14,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Score bar row
// ---------------------------------------------------------------------------

function ScoreBar({ label, pct }: { label: string; pct: number }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 13, color: "#475569", fontWeight: "500" }}>{label}</Text>
        <Text style={{ fontSize: 13, color: "#1e293b", fontWeight: "700" }}>{pct}%</Text>
      </View>
      <View style={{ height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
        <View
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: "#1e293b",
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Control bar icon button
// ---------------------------------------------------------------------------

function ControlBtn({
  children,
  onPress,
  red,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  red?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: red ? 52 : 40,
        height: red ? 52 : 40,
        borderRadius: red ? 26 : 20,
        backgroundColor: red ? "#ef4444" : "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function MockInterviewQuestionScreen() {
  const router = useRouter();

  const sessionId = useAppSelector((s) => s.mockInterview.sessionId);
  const currentQuestionText = useAppSelector((s) => s.mockInterview.currentQuestionText);
  const currentQuestionId = useAppSelector((s) => s.mockInterview.currentQuestionId);
  const currentQuestionOrder = useAppSelector((s) => s.mockInterview.currentQuestionOrder);
  const totalQuestions = useAppSelector((s) => s.mockInterview.totalQuestions);
  const isComplete = useAppSelector((s) => s.mockInterview.isComplete);

  const [lastScore, setLastScore] = useState<SubmitAnswerResponse | null>(null);
  const [transcript, setTranscript] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { isLoading: isLoadingQuestion, isError: questionError } = useGetNextQuestionQuery(
    sessionId ?? "",
    { skip: !sessionId },
  );

  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation();

  const { isRecording, audioFile, startRecording, stopRecording } = useVoiceRecorder();

  useEffect(() => {
    if (isComplete) {
      router.replace(ROUTE_RESULT);
    }
  }, [isComplete, router]);

  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      setTranscript("");
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !currentQuestionId) return;
    setSubmitError(null);
    try {
      const result = await submitAnswer({
        sessionId,
        questionId: currentQuestionId,
        audioFile: audioFile ?? undefined,
        transcript: transcript || undefined,
      }).unwrap();
      setLastScore(result);
      setTranscript("");
      router.push(ROUTE_FEEDBACK);
    } catch {
      setSubmitError("Submission failed. Please try again.");
    }
  }, [sessionId, currentQuestionId, audioFile, transcript, submitAnswer, router]);

  const criteriaScores = lastScore?.score_breakdown?.criteria_scores ?? [];
  const findByName = (keyword: string, fallbackIdx: number) => {
    const match = criteriaScores.find((c) => c.name.toLowerCase().includes(keyword));
    return Math.round(
      Math.min(100, (match?.score ?? criteriaScores[fallbackIdx]?.score ?? 0) * 10),
    );
  };
  const commPct = lastScore ? Math.round(Math.min(100, (lastScore.score ?? 0) * 10)) : 0;
  const clarityPct = findByName("clarity", 0);
  const relevancePct = findByName("relevance", 1);
  const confidencePct = findByName("confidence", 2);
  const behaviourPct = lastScore ? Math.round((relevancePct + confidencePct) / 2) : 0;

  const canSubmit = !isSubmitting && (audioFile !== null || transcript.length > 0) && !isRecording;

  if (isLoadingQuestion) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (questionError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <Text style={{ color: "#94a3b8", textAlign: "center", fontSize: 14, lineHeight: 22 }}>
          Failed to load question.{"\n"}Check your connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {/* ── Top header ────────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff", textAlign: "center" }}>
          {SCREEN_TITLE}
        </Text>
      </View>

      {/* ── Dark video area ────────────────────────────────────────────────── */}
      <View style={{ height: 240, backgroundColor: "#111827", position: "relative" }}>
        {/* Recording badge */}
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
            gap: 6,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isRecording ? "#ef4444" : "#94a3b8",
            }}
          />
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
            {isRecording ? "Recording" : "Ready"}
          </Text>
        </View>

        {/* Thumbnail */}
        <View
          style={{
            position: "absolute",
            bottom: 64,
            right: 16,
            width: 72,
            height: 96,
            backgroundColor: "#1e293b",
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        />

        {/* Control bar */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            backgroundColor: "rgba(0,0,0,0.6)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            paddingHorizontal: 24,
          }}
        >
          <ControlBtn onPress={handleRecordToggle}>
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={20}
              color={isRecording ? "#ef4444" : "#fff"}
            />
          </ControlBtn>
          <ControlBtn>
            <Ionicons name="videocam-outline" size={20} color="#fff" />
          </ControlBtn>
          <ControlBtn
            red
            onPress={() => {
              router.replace(ROUTE_HOME);
            }}
          >
            <Ionicons
              name="call"
              size={22}
              color="#fff"
              style={{ transform: [{ rotate: "135deg" }] }}
            />
          </ControlBtn>
          <ControlBtn>
            <Ionicons name="settings-outline" size={20} color="#fff" />
          </ControlBtn>
          <ControlBtn>
            <Ionicons name="person-outline" size={20} color="#fff" />
          </ControlBtn>
        </View>
      </View>

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Question row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#94a3b8", letterSpacing: 0.3 }}>
              Questions {currentQuestionOrder ?? 1} of {totalQuestions ?? 10}
            </Text>
            <Ionicons name="volume-medium-outline" size={18} color="#94a3b8" />
          </View>

          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#1e293b",
              lineHeight: 24,
              marginBottom: 16,
            }}
          >
            {currentQuestionText ?? "Tell me more about yourself and why you chose this company?"}
          </Text>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#f1f5f9", marginBottom: 14 }} />

          {/* Transcript */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748b" }}>Transcript</Text>
            <Ionicons name="volume-medium" size={16} color="#3b82f6" />
          </View>
          <Text
            style={{
              fontSize: 13,
              color: "#94a3b8",
              lineHeight: 20,
              marginBottom: 20,
              fontStyle: "italic",
            }}
          >
            {isRecording ? "Listening..." : transcript || "Tap the mic to start speaking..."}
          </Text>

          {/* Score circles — shown after first answer */}
          {lastScore && (
            <>
              <View style={{ flexDirection: "row", marginBottom: 20, gap: 12 }}>
                <ScoreCircle pct={commPct} label={"Communication\nScore"} />
                <ScoreCircle pct={behaviourPct} label={"Behaviour\nScore"} />
              </View>

              {/* Score analysis */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1e293b" }}>
                  Score Analysis
                </Text>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: "#94a3b8",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 10, color: "#94a3b8", fontWeight: "700" }}>i</Text>
                </View>
              </View>

              <ScoreBar label="Clarity & Articulation" pct={clarityPct} />
              <ScoreBar label="Listening & Responsiveness" pct={relevancePct} />
              <ScoreBar label="Verbal Fluency" pct={confidencePct} />
            </>
          )}

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => ({
              marginTop: 16,
              backgroundColor: canSubmit ? "#1e293b" : "#e2e8f0",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              opacity: pressed && canSubmit ? 0.8 : 1,
            })}
          >
            {isSubmitting ? (
              <ActivityIndicator color={canSubmit ? "#fff" : "#94a3b8"} />
            ) : (
              <Text
                style={{ color: canSubmit ? "#fff" : "#94a3b8", fontWeight: "700", fontSize: 15 }}
              >
                Submit Answer
              </Text>
            )}
          </Pressable>

          {submitError && (
            <Text
              style={{
                marginTop: 10,
                color: "#ef4444",
                fontSize: 13,
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              {submitError}
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
