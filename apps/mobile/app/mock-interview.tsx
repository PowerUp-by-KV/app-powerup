import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetProfileQuery } from "@/services/auth-api";
import {
  useStartMockInterviewMutation,
  useLazyGetNextQuestionQuery,
  useSubmitMockAnswerMutation,
  useGetMockInterviewResultsQuery,
  type InterviewSession,
  type NextQuestion,
  type SubmitAnswerResponse,
} from "@/services/interview-api";

type Screen = "setup" | "question" | "answer_review" | "results";

const DOMAINS = ["general", "IT", "Finance", "Banking", "Government"] as const;

export default function InterviewPlaygroundScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();

  const [screen, setScreen] = useState<Screen>("setup");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<NextQuestion | null>(null);
  const [lastAnswer, setLastAnswer] = useState<SubmitAnswerResponse | null>(null);
  const [transcript, setTranscript] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("general");

  const cefrLevel = profile?.cefr_range ?? "B1-B2";

  const [startSession, { isLoading: starting }] = useStartMockInterviewMutation();
  const [fetchQuestion] = useLazyGetNextQuestionQuery();
  const [submitAnswer, { isLoading: submitting }] = useSubmitMockAnswerMutation();

  const { data: results } = useGetMockInterviewResultsQuery(session?.id ?? "", {
    skip: session?.status !== "completed",
  });

  const handleStart = async () => {
    try {
      const s = await startSession({ cefr_level: cefrLevel, domain: selectedDomain }).unwrap();
      setSession(s);
      await loadNextQuestion(s.id);
      setScreen("question");
    } catch {
      Alert.alert("Error", "Could not start session. Please try again.");
    }
  };

  const loadNextQuestion = async (sessionId: string) => {
    const q = await fetchQuestion(sessionId).unwrap();
    if ("complete" in q) {
      setScreen("results");
    } else {
      setCurrentQuestion(q);
    }
  };

  const handleSubmit = async () => {
    if (!session || !currentQuestion || !transcript.trim()) {
      Alert.alert("Empty answer", "Please type your answer before submitting.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("question_id", currentQuestion.question_id);
      fd.append("transcript", transcript.trim());
      const result = await submitAnswer({ sessionId: session.id, formData: fd }).unwrap();
      setLastAnswer(result);
      setTranscript("");
      setScreen("answer_review");
      if (result.session_complete) {
        setSession((prev) => (prev ? { ...prev, status: "completed" } : prev));
      }
    } catch {
      Alert.alert("Error", "Failed to submit answer. Please try again.");
    }
  };

  const handleNext = async () => {
    if (!session) return;
    if (lastAnswer?.session_complete) {
      setScreen("results");
      return;
    }
    await loadNextQuestion(session.id);
    setScreen("question");
  };

  if (screen === "setup") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#475569" />
          </Pressable>

          <Text style={styles.heading}>Interview Playground</Text>
          <Text style={styles.sub}>
            Practice without pressure. Choose a topic and start whenever you&apos;re ready.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Your CEFR Level</Text>
            <Text style={styles.cefrBadge}>{cefrLevel}</Text>
          </View>

          <Text style={styles.label}>Choose a Domain</Text>
          <View style={styles.domainRow}>
            {DOMAINS.map((d) => (
              <Pressable
                key={d}
                style={[styles.domainChip, selectedDomain === d && styles.domainChipActive]}
                onPress={() => setSelectedDomain(d)}
              >
                <Text style={[styles.domainText, selectedDomain === d && styles.domainTextActive]}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.primaryBtn, starting && styles.primaryBtnDisabled]}
            onPress={handleStart}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryBtnText}>Start Session</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "question" && currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              Q{currentQuestion.question_order} of {session?.total_questions}
            </Text>
            <Pressable
              onPress={() => {
                Alert.alert("Exit session?", "Your progress will be saved.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Exit", onPress: () => router.back() },
                ]);
              }}
            >
              <Feather name="x" size={22} color="#94a3b8" />
            </Pressable>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          </View>

          {currentQuestion.follow_up_prompts.length > 0 && (
            <View style={styles.promptsBox}>
              <Text style={styles.promptsLabel}>Think about:</Text>
              {currentQuestion.follow_up_prompts.map((p, i) => (
                <Text key={i} style={styles.promptItem}>
                  • {p}
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.label}>Your Answer</Text>
          <TextInput
            style={styles.answerInput}
            multiline
            placeholder="Type your answer here..."
            placeholderTextColor="#94a3b8"
            value={transcript}
            onChangeText={setTranscript}
          />

          <Pressable
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryBtnText}>Submit Answer</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "answer_review" && lastAnswer) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Answer Scored</Text>

          <View style={[styles.card, styles.scoreCard]}>
            <Text style={styles.scoreNumber}>{(lastAnswer.score ?? 0).toFixed(1)}</Text>
            <Text style={styles.scoreDenominator}>/10</Text>
          </View>

          {lastAnswer.score_breakdown?.criteria_scores.map((c, i) => (
            <View key={i} style={styles.criteriaRow}>
              <View style={styles.criteriaHeader}>
                <Text style={styles.criteriaName}>{c.name}</Text>
                <Text style={styles.criteriaScore}>{c.score.toFixed(1)}</Text>
              </View>
              <Text style={styles.criteriaFeedback}>{c.feedback}</Text>
            </View>
          ))}

          {lastAnswer.feedback && (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackLabel}>Overall Feedback</Text>
              <Text style={styles.feedbackText}>{lastAnswer.feedback}</Text>
            </View>
          )}

          <Pressable style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>
              {lastAnswer.session_complete ? "View Results" : "Next Question"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "results") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Session Complete!</Text>

          {results && (
            <>
              <View style={[styles.card, styles.scoreCard]}>
                <Text style={styles.gradeText}>{results.grade}</Text>
                <Text style={styles.scoreDenominator}>
                  Score: {(results.session.total_score ?? 0).toFixed(1)}/10
                </Text>
              </View>

              <Text style={styles.label}>{results.answers.length} questions answered</Text>
            </>
          )}

          <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryBtn, { backgroundColor: "#e0e7ff", marginTop: 8 }]}
            onPress={() => {
              setSession(null);
              setCurrentQuestion(null);
              setLastAnswer(null);
              setScreen("setup");
            }}
          >
            <Text style={[styles.primaryBtnText, { color: "#4338ca" }]}>Practice Again</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator style={{ marginTop: 80 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 24, paddingBottom: 60 },
  backBtn: { marginBottom: 16 },
  heading: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cefrBadge: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4f46e5",
    marginTop: 4,
  },
  domainRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  domainChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "white",
  },
  domainChipActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  domainText: { fontSize: 13, color: "#475569", fontWeight: "500" },
  domainTextActive: { color: "white" },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  progressText: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  questionText: { fontSize: 18, fontWeight: "600", color: "#1e293b", lineHeight: 28 },
  promptsBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  promptsLabel: { fontSize: 12, fontWeight: "700", color: "#0284c7", marginBottom: 6 },
  promptItem: { fontSize: 13, color: "#0369a1", lineHeight: 20 },
  answerInput: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 140,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  scoreCard: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  scoreNumber: { fontSize: 52, fontWeight: "800", color: "#4f46e5" },
  scoreDenominator: { fontSize: 18, color: "#94a3b8", marginBottom: 8 },
  gradeText: { fontSize: 28, fontWeight: "800", color: "#4f46e5" },
  criteriaRow: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  criteriaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  criteriaName: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  criteriaScore: { fontSize: 14, fontWeight: "700", color: "#4f46e5" },
  criteriaFeedback: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  feedbackBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  feedbackLabel: { fontSize: 12, fontWeight: "700", color: "#15803d", marginBottom: 6 },
  feedbackText: { fontSize: 14, color: "#166534", lineHeight: 20 },
});
