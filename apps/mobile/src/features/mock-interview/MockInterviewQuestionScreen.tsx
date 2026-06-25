/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Animated } from "react-native";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeBack } from "@/hooks/useSafeBack";

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

function ScoreCircle({
  pct,
  label,
  isDark,
  color,
}: {
  pct: number;
  label: string;
  isDark: boolean;
  color?: string;
}) {
  const radius = 36;
  const stroke = 5;
  const normalised = Math.min(100, Math.max(0, pct));
  const spinAnim = useRef(new Animated.Value(0)).current;
  const arcColor = color || "#3b82f6";

  useEffect(() => {
    Animated.timing(spinAnim, {
      toValue: normalised / 100,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [normalised]);

  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <View
        style={{
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          borderWidth: stroke,
          borderColor: isDark ? "#374151" : "#e2e8f0",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            borderWidth: stroke,
            borderColor: arcColor,
            borderRightColor: normalised > 25 ? arcColor : "transparent",
            borderTopColor: normalised > 50 ? arcColor : "transparent",
            borderLeftColor: normalised > 75 ? arcColor : "transparent",
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
        <Text style={{ fontSize: 16, fontWeight: "800", color: isDark ? "#fff" : "#1e293b" }}>
          {pct}%
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 }}>
        <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#64748b", textAlign: "center" }}>
          {label}
        </Text>
        <Ionicons
          name="information-circle-outline"
          size={12}
          color={isDark ? "#9ca3af" : "#64748b"}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Score bar row
// ---------------------------------------------------------------------------

function ScoreBar({ label, pct, isDark }: { label: string; pct: number; isDark: boolean }) {
  const bgColor = isDark ? "#374151" : "#f1f5f9";
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 13, color: isDark ? "#9ca3af" : "#475569", fontWeight: "500" }}>
          {label}
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? "#fff" : "#1e293b", fontWeight: "700" }}>
          {pct}%
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: bgColor, borderRadius: 3, overflow: "hidden" }}>
        <View
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: "#3b82f6",
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
  const insets = useSafeAreaInsets();
  const goBack = useSafeBack(ROUTE_HOME);

  const sessionId = useAppSelector((s) => s.mockInterview.sessionId);
  const currentQuestionText = useAppSelector((s) => s.mockInterview.currentQuestionText);
  const currentQuestionId = useAppSelector((s) => s.mockInterview.currentQuestionId);
  const currentQuestionOrder = useAppSelector((s) => s.mockInterview.currentQuestionOrder);
  const totalQuestions = useAppSelector((s) => s.mockInterview.totalQuestions);
  const isComplete = useAppSelector((s) => s.mockInterview.isComplete);

  const [lastScore, setLastScore] = useState<SubmitAnswerResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { isLoading: isLoadingQuestion, isError: questionError } = useGetNextQuestionQuery(
    sessionId ?? "",
    { skip: !sessionId },
  );

  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation();

  const { isRecording, audioFile, transcript, startRecording, stopRecording } = useVoiceRecorder();

  useEffect(() => {
    if (isComplete) {
      router.replace(ROUTE_RESULT);
    }
  }, [isComplete, router]);

  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !currentQuestionId) {
      setSubmitError("Question not loaded yet. Please wait a moment and try again.");
      return;
    }
    setSubmitError(null);
    try {
      const result = await submitAnswer({
        sessionId,
        questionId: currentQuestionId,
        audioFile: undefined, // Omit audioFile to force instant transcript grading on backend
        transcript: transcript || undefined,
      }).unwrap();
      setLastScore(result);
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

  const canSubmit =
    !isSubmitting &&
    !!currentQuestionId &&
    (audioFile !== null || transcript.length > 0) &&
    !isRecording;

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#111827" : "#fff";
  const cardBg = isDark ? "#1f2937" : "#f8fafc";
  const textColor = isDark ? "#fff" : "#1e293b";
  const subTextColor = isDark ? "#9ca3af" : "#64748b";

  const cardStyle = {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  };

  if (isLoadingQuestion) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#111827" : "#f8fafc",
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
          backgroundColor: isDark ? "#111827" : "#f8fafc",
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
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#111827" : "#0f172a",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* ── Top header ────────────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={goBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* ── Dark video area ────────────────────────────────────────────────── */}
      <View style={{ height: 280, alignItems: "center" }}>
        {/* Main Video Placeholder (Interviewer) */}
        <View
          style={{
            width: "85%",
            height: 200,
            backgroundColor: "#1e293b",
            borderRadius: 24,
            position: "relative",
          }}
        >
          {/* Recording badge */}
          <View
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center",
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
          </View>

          {/* User Thumbnail */}
          <View
            style={{
              position: "absolute",
              bottom: -20,
              right: -10,
              width: 80,
              height: 110,
              backgroundColor: "#334155",
              borderRadius: 16,
              borderWidth: 3,
              borderColor: isDark ? "#111827" : "#0f172a",
            }}
          />
        </View>

        {/* Control bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: 24,
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
          <ControlBtn red onPress={() => router.replace(ROUTE_HOME)}>
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
            <Ionicons name="people-outline" size={20} color="#fff" />
          </ControlBtn>
        </View>
      </View>

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <View
        style={{
          flex: 1,
          backgroundColor: bgColor,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card */}
          <View style={cardStyle}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Ionicons
                name="podium"
                size={14}
                color="#3b82f6"
                style={{ transform: [{ rotate: "180deg" }] }}
              />
              <Text style={{ fontSize: 13, fontWeight: "700", color: textColor }}>
                Questions {currentQuestionOrder ?? 1} of {totalQuestions ?? 10}
              </Text>
              <Ionicons name="volume-medium-outline" size={16} color={subTextColor} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "500", color: subTextColor, lineHeight: 22 }}>
              {currentQuestionText ?? "Tell me more about yourself and why you chose this company?"}
            </Text>
          </View>

          {/* Transcript Card */}
          <View style={cardStyle}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: textColor }}>Transcript</Text>
              <Ionicons name="volume-medium-outline" size={16} color={subTextColor} />
            </View>
            <Text
              style={{
                fontSize: 14,
                color: subTextColor,
                lineHeight: 22,
                fontStyle: "italic",
              }}
            >
              {isRecording ? "Listening..." : transcript || "Tap the mic to start speaking..."}
            </Text>
          </View>

          {/* Score circles — shown after first answer */}
          {lastScore && (
            <>
              <View style={[cardStyle, { flexDirection: "row", justifyContent: "space-around" }]}>
                <ScoreCircle
                  pct={commPct}
                  label={"Communication Score"}
                  isDark={isDark}
                  color="#3b82f6"
                />
                <ScoreCircle
                  pct={behaviourPct}
                  label={"Behaviour Score"}
                  isDark={isDark}
                  color="#bef264"
                />
              </View>

              {/* Score analysis */}
              <View style={cardStyle}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "800", color: textColor }}>
                    Score Analysis
                  </Text>
                  <Ionicons name="information-circle-outline" size={16} color={subTextColor} />
                </View>

                <ScoreBar label="Clarity & Articulation" pct={clarityPct} isDark={isDark} />
                <ScoreBar label="Listening & Responsiveness" pct={relevancePct} isDark={isDark} />
                <ScoreBar label="Verbal Fluency" pct={confidencePct} isDark={isDark} />
              </View>
            </>
          )}

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => ({
              marginTop: 4,
              backgroundColor: canSubmit
                ? isDark
                  ? "#3b82f6"
                  : "#1e293b"
                : isDark
                  ? "#374151"
                  : "#e2e8f0",
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
                style={{
                  color: canSubmit ? "#fff" : isDark ? "#9ca3af" : "#94a3b8",
                  fontWeight: "700",
                  fontSize: 15,
                }}
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
    </View>
  );
}
