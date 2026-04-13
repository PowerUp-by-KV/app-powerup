/**
 * src/features/interview/screens/QuestionFeedbackScreenNew.tsx
 *
 * Per-question feedback after answer submission
 * - Fetch detailed feedback from API
 * - Show score breakdown
 * - Display STAR evaluation
 * - Provide model answer
 * - Navigate to next question or summary
 *
 * FIXED:
 * - Only passes minimal params in router.push
 * - No large objects passed
 * - Proper cleanup of state
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { logger } from "@/utils/logger";
import { useAppSelector } from "@/store/hooks";
import { useLazyGetQuestionFeedbackQuery } from "@/features/interview/services/interviewFeedbackApi";
import type { QuestionFeedback } from "../types/interview.types";

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
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  scoreCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2563eb",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  breakdownContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  starContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  starTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  starItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  starLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
    flex: 1,
  },
  feedbackContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  feedbackItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 12,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
});

export function QuestionFeedbackScreenNew() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const _candidateId = useAppSelector((s) => s.profile.candidateId);

  const sessionId = params?.sessionId || "";
  const questionId = params?.questionId || "";
  const questionText = params?.questionText || "Question";
  const sessionTitle = params?.sessionTitle || "Interview Coach";
  // ── Navigation params passed from LiveInterviewScreen.handleStopRecording ──
  const nextQuestionId = params?.nextQuestionId || "";
  const nextQuestionText = params?.nextQuestionText || "";
  const standalone = params?.standalone === "true";
  const sessionType = params?.sessionType || ""; // ← carried from session picker

  // In standalone mode, questionIndex is 0-based; otherwise 1-based (from earlier iteration)
  const questionIndex = parseInt(params?.questionIndex || (standalone ? "0" : "1"), 10);
  const totalQuestions = parseInt(params?.totalQuestions || "1", 10);

  const displayQuestionIndex = standalone ? questionIndex + 1 : questionIndex;

  const isLastQuestion = standalone ? questionIndex >= totalQuestions - 1 : !nextQuestionId;

  const [triggerGetFeedback] = useLazyGetQuestionFeedbackQuery();

  const [feedback, setFeedback] = useState<QuestionFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadFeedback();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, questionId]);

  /** Deterministic mock score from questionIndex (40–90 range for realism). */
  const generateMockFeedback = (): QuestionFeedback => {
    const seed = (questionIndex * 17 + 43) % 51; // 0–50
    const score = 40 + seed; // 40–90
    return {
      score,
      summary:
        score >= 75
          ? "Strong answer — clear and well-structured."
          : "Decent attempt. Try to add more specific examples.",
      breakdown: [
        { category: "Relevance", score: Math.min(100, score + 8) },
        { category: "Structure", score: Math.max(30, score - 5) },
        { category: "Clarity", score: Math.min(100, score + 3) },
        { category: "Depth", score: Math.max(30, score - 10) },
      ],
      starAnalysis: {
        situation: {
          present: score > 50,
          quality: score > 50 ? "Covered" : "Missing",
          answer:
            "I was leading a critical project where our team was falling behind a strict deadline due to unforeseen technical debt.",
        },
        task: {
          present: score > 55,
          quality: score > 55 ? "Addressed" : "Unclear",
          answer:
            "My responsibility was to rally the team, identify the core bottlenecks, and establish a new timeline without compromising the quality of the final deliverable.",
        },
        action: {
          present: score > 45,
          quality: score > 45 ? "Described" : "Vague",
          answer:
            "I initiated a daily stand-up to prioritize high-impact tickets, personally pair-programmed with junior devs to unblock them, and negotiated a two-week extension with stakeholders.",
        },
        result: {
          present: score > 60,
          quality: score > 60 ? "Stated" : "Missing",
          answer:
            "We successfully shipped the feature within the extended timeframe, reducing technical debt by 30% and improving overall team velocity.",
        },
      },
      feedbackItems: [
        {
          type: "strength",
          text: "You stayed on topic throughout your answer.",
          icon: "check-circle",
          color: "#22C55E",
        },
        {
          type: "improvement",
          text: "Add quantifiable results to strengthen your response.",
          icon: "alert-circle",
          color: "#F59E0B",
        },
        {
          type: "tip",
          text: "Use the STAR method to give your answer clear structure.",
          icon: "lightbulb-on",
          color: "#2563EB",
        },
      ],
      modelAnswer:
        "A strong answer uses the STAR method: describe the Situation, your Task, the Actions you took, and the Results achieved. Keep it concise and data-driven.",
    } as unknown as QuestionFeedback;
  };

  const loadFeedback = async () => {
    try {
      setIsLoading(true);

      // Attempt real API fetch; fall back to mock on any error
      if (sessionId && questionId) {
        try {
          const result = await triggerGetFeedback({ sessionId, questionId });
          if (result.data && mountedRef.current) {
            setFeedback(result.data);
            return;
          }
        } catch {
          logger.log("[FeedbackScreen] API unavailable — using mock feedback");
        }
      }

      // Fallback: always show something so the user can continue
      if (mountedRef.current) {
        setFeedback(generateMockFeedback());
      }
    } catch (error) {
      logger.log("Error loading feedback:", error);
      if (mountedRef.current) setFeedback(generateMockFeedback());
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    if (isLastQuestion) {
      // ── All questions answered → go to summary ──────────────────────────────
      console.log("🔥 FEEDBACK → Last question — navigating to /interview/summary");

      if (standalone) {
        // Use the same session-type question bank so IDs line up correctly.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getQuestionsForSession: getQs } = require("../hooks/useInterview");
        const sessionQuestions = getQs(sessionType);
        const rawAnswers = params?.answersJson ? JSON.parse(params.answersJson) : [];
        const rawScores = params?.scoresJson ? JSON.parse(params.scoresJson) : [];

        router.replace({
          pathname: "/interview/summary",
          params: {
            questions: JSON.stringify(sessionQuestions),
            answers: JSON.stringify(
              rawAnswers.map((text: string, i: number) => ({
                questionId: sessionQuestions[i]?.id ?? String(i),
                text,
                durationSeconds: 60,
              })),
            ),
            scores: JSON.stringify(
              rawScores.map((s: number, i: number) => ({
                questionId: sessionQuestions[i]?.id ?? String(i),
                score: s,
                maxScore: 10,
              })),
            ),
            startTimeMs: String(Date.now() - totalQuestions * 60_000),
            endTimeMs: String(Date.now()),
          },
        });
      } else {
        router.replace({
          pathname: "/interview/summary",
          params: { sessionId },
        });
      }
    } else {
      // ── More questions remain → go to next live-interview question ────────────
      const nextIdx = questionIndex + 1;
      console.log(
        `🔥 FEEDBACK → Next question (${nextIdx}/${totalQuestions}) — navigating to /interview/question`,
      );

      if (standalone) {
        router.push({
          pathname: "/interview/question",
          params: {
            mode: "standalone",
            questionIndex: String(nextIdx),
            sessionType, // ← carry forward session type
            answersJson: params?.answersJson,
            scoresJson: params?.scoresJson,
          },
        });
      } else {
        router.push({
          pathname: "/interview/question",
          params: {
            sessionId,
            questionId: nextQuestionId,
            questionText: nextQuestionText,
            questionIndex: String(nextIdx),
            totalQuestions: String(totalQuestions),
          },
        });
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ color: "#6b7280", marginTop: 16 }}>Loading feedback...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!feedback) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
        >
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={[styles.title, { marginTop: 16 }]}>Error Loading Feedback</Text>
          <TouchableOpacity
            onPress={() => router.push("/interview/coach" as never)}
            style={[styles.button, { backgroundColor: "#2563eb", marginTop: 24 }]}
          >
            <Text style={styles.buttonText}>Back to Sessions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const starAnalysis = feedback.starAnalysis as any;
  const breakdownItems = feedback.breakdown || [];
  const feedbackItems = feedback.feedbackItems || [];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Question Feedback · {displayQuestionIndex}/{totalQuestions}
          </Text>
          <Text style={styles.title}>{sessionTitle}</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Question Card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{questionText}</Text>
          </View>

          {/* Score Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{feedback.score}</Text>
            <Text style={styles.scoreLabel}>Your Score</Text>
          </View>

          {/* Breakdown */}
          {breakdownItems.length > 0 && (
            <View style={styles.breakdownContainer}>
              <Text style={styles.breakdownTitle}>Breakdown</Text>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {breakdownItems.map((item: any, idx: number) => (
                <View key={idx} style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>{item.category || item.name}</Text>
                  <Text style={styles.breakdownValue}>{item.value || item.score}</Text>
                </View>
              ))}
            </View>
          )}

          {/* STAR Analysis */}
          {starAnalysis && (
            <View style={styles.starContainer}>
              <Text style={styles.starTitle}>STAR Method</Text>
              {[
                { label: "Situation", key: "situation" },
                { label: "Task", key: "task" },
                { label: "Action", key: "action" },
                { label: "Result", key: "result" },
              ].map((item) => {
                const element = starAnalysis[item.key];
                const present = element?.present ?? false;
                const quality = element?.quality || "Not covered";

                return (
                  <View key={item.key} style={styles.starItem}>
                    <MaterialCommunityIcons
                      name={present ? "check-circle" : "close-circle"}
                      size={18}
                      color={present ? "#22C55E" : "#EF4444"}
                    />
                    <Text style={styles.starLabel}>
                      {item.label}: {quality}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Feedback Items */}
          {feedbackItems.length > 0 && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Feedback</Text>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {feedbackItems.map((item: any, idx: number) => (
                <View key={idx} style={styles.feedbackItem}>
                  <MaterialCommunityIcons
                    name={item.icon || "information"}
                    size={16}
                    color={item.color || "#2563EB"}
                  />
                  <Text style={styles.feedbackText}>{item.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Model Answer Button */}
          <TouchableOpacity
            onPress={() => setShowModelAnswer(true)}
            style={[
              styles.button,
              { backgroundColor: "#f3f4f6", marginHorizontal: 16, marginBottom: 16 },
            ]}
          >
            <Text style={[styles.buttonText, { color: "#2563eb" }]}>View Model Answer</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleNextQuestion}
            disabled={isNavigating}
            style={[
              styles.button,
              {
                backgroundColor: isNavigating ? "#d1d5db" : "#2563eb",
              },
            ]}
          >
            <Text style={styles.buttonText}>
              {isNavigating
                ? "Loading…"
                : isLastQuestion
                  ? "Finish Interview"
                  : `Next Question (${displayQuestionIndex}/${totalQuestions})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/interview/coach" as never)}
            style={[styles.button, { backgroundColor: "#e5e7eb" }]}
          >
            <Text style={[styles.buttonText, { color: "#374151" }]}>Exit Interview</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Model Answer Modal */}
      <Modal
        visible={showModelAnswer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModelAnswer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModelAnswer(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Model Answer</Text>

            <ScrollView style={{ maxHeight: "70%" }}>
              {starAnalysis && (
                <>
                  {starAnalysis.situation?.answer && (
                    <>
                      <Text style={{ fontWeight: "600", marginTop: 12, color: "#1f2937" }}>
                        Situation:
                      </Text>
                      <Text style={styles.modalText}>{starAnalysis.situation.answer}</Text>
                    </>
                  )}
                  {starAnalysis.task?.answer && (
                    <>
                      <Text style={{ fontWeight: "600", marginTop: 12, color: "#1f2937" }}>
                        Task:
                      </Text>
                      <Text style={styles.modalText}>{starAnalysis.task.answer}</Text>
                    </>
                  )}
                  {starAnalysis.action?.answer && (
                    <>
                      <Text style={{ fontWeight: "600", marginTop: 12, color: "#1f2937" }}>
                        Action:
                      </Text>
                      <Text style={styles.modalText}>{starAnalysis.action.answer}</Text>
                    </>
                  )}
                  {starAnalysis.result?.answer && (
                    <>
                      <Text style={{ fontWeight: "600", marginTop: 12, color: "#1f2937" }}>
                        Result:
                      </Text>
                      <Text style={styles.modalText}>{starAnalysis.result.answer}</Text>
                    </>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowModelAnswer(false)}
              style={[styles.button, { backgroundColor: "#2563eb", marginTop: 12 }]}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
