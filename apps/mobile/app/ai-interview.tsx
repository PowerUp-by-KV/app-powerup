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
import { useGetResumeQuery } from "@/services/resume-api";
import { api } from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AiSession {
  id: string;
  status: string;
  total_questions: number;
  questions_answered: number;
}

interface AiQuestion {
  id: string;
  question_text: string;
  skill_keyword: string;
  difficulty: string;
}

interface AiAnswerResult {
  score: number | null;
  feedback: string | null;
  score_breakdown: {
    criteria_scores: { name: string; score: number; feedback: string }[];
  } | null;
  questions_remaining: number;
  session_complete: boolean;
}

type Screen = "gate" | "setup" | "question" | "answer_review" | "results";

// ─── AI Interview Hooks (raw RTK Query calls via api.endpoints) ───────────────

const aiInterviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAiSession: builder.mutation<AiSession, void>({
      query: () => ({ url: "/v1/interviews/sessions", method: "POST", body: {} }),
    }),
    getAiSessionQuestion: builder.query<AiQuestion, string>({
      query: (sessionId) => `/v1/interviews/session/${sessionId}/next`,
    }),
    submitAiAnswer: builder.mutation<AiAnswerResult, { sessionId: string; formData: FormData }>({
      query: ({ sessionId, formData }) => ({
        url: `/v1/interviews/sessions/${sessionId}/answer`,
        method: "POST",
        body: formData,
      }),
    }),
    getAiResults: builder.query<
      { session: AiSession; grade: string; answers: AiAnswerResult[] },
      string
    >({
      query: (sessionId) => `/v1/interviews/session/${sessionId}/replay`,
    }),
  }),
  overrideExisting: false,
});

const {
  useCreateAiSessionMutation,
  useLazyGetAiSessionQuestionQuery,
  useSubmitAiAnswerMutation,
  useGetAiResultsQuery,
} = aiInterviewApi;

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function AiInterviewScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const userId = (profile as { id?: string } | undefined)?.id ?? "";
  const { data: resume, isLoading: resumeLoading } = useGetResumeQuery(userId, {
    skip: !userId,
  });

  const [screen, setScreen] = useState<Screen>("gate");
  const [session, setSession] = useState<AiSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AiQuestion | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AiAnswerResult | null>(null);
  const [transcript, setTranscript] = useState("");

  const hasSkills = resume?.parse_status === "completed" && (resume.skills?.length ?? 0) > 0;

  const [createSession, { isLoading: creating }] = useCreateAiSessionMutation();
  const [fetchQuestion, { isFetching: fetchingQ }] = useLazyGetAiSessionQuestionQuery();
  const [submitAnswer, { isLoading: submitting }] = useSubmitAiAnswerMutation();

  const { data: results } = useGetAiResultsQuery(session?.id ?? "", {
    skip: !session || session.status !== "completed",
  });

  const handleStart = async () => {
    try {
      const s = await createSession().unwrap();
      setSession(s);
      const q = await fetchQuestion(s.id).unwrap();
      setCurrentQuestion(q);
      setScreen("question");
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "data" in e
          ? (e as { data?: { detail?: string } }).data?.detail
          : "Could not start interview. Make sure your resume is uploaded.";
      Alert.alert("Error", msg ?? "Could not start interview.");
    }
  };

  const handleSubmit = async () => {
    if (!session || !currentQuestion || !transcript.trim()) {
      Alert.alert("Empty answer", "Please type your answer before submitting.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("question_id", currentQuestion.id);
      fd.append("transcript", transcript.trim());
      const result = await submitAnswer({ sessionId: session.id, formData: fd }).unwrap();
      setLastAnswer(result);
      setTranscript("");
      if (result.session_complete) {
        setSession((prev) => (prev ? { ...prev, status: "completed" } : prev));
      }
      setScreen("answer_review");
    } catch {
      Alert.alert("Error", "Failed to submit. Please try again.");
    }
  };

  const handleNext = async () => {
    if (!session) return;
    if (lastAnswer?.session_complete) {
      setScreen("results");
      return;
    }
    try {
      const q = await fetchQuestion(session.id).unwrap();
      setCurrentQuestion(q);
      setScreen("question");
    } catch {
      setScreen("results");
    }
  };

  // ─── Gate: resume not uploaded ─────────────────────────────────────────────

  if (resumeLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!hasSkills) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#475569" />
          </Pressable>
          <Text style={styles.heading}>Interview Buddy</Text>
          <View style={styles.gateCard}>
            <Feather name="file-text" size={40} color="#6366f1" />
            <Text style={styles.gateTitle}>Upload your resume first</Text>
            <Text style={styles.gateSub}>
              Interview Buddy generates questions from your real skills and experience. Upload your
              resume during onboarding or from the Resume Studio.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.push("/resume" as never)}>
              <Text style={styles.primaryBtnText}>Go to Resume Studio</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "setup") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#475569" />
          </Pressable>
          <Text style={styles.heading}>Interview Buddy</Text>
          <Text style={styles.sub}>
            Questions are generated from your resume skills. Ready when you are.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Resume skills loaded</Text>
            <Text style={styles.cefrBadge}>
              {resume?.skills?.slice(0, 5).join(", ") ?? "—"}
              {(resume?.skills?.length ?? 0) > 5
                ? ` +${(resume?.skills?.length ?? 0) - 5} more`
                : ""}
            </Text>
          </View>

          <Pressable
            style={[styles.primaryBtn, creating && styles.primaryBtnDisabled]}
            onPress={handleStart}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryBtnText}>Start Interview</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Default: show setup after gate passes
  if (screen === "gate") {
    setScreen("setup");
    return null;
  }

  if (screen === "question" && currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressText}>
                Q{(session?.questions_answered ?? 0) + 1} of {session?.total_questions}
              </Text>
              <Text style={styles.skillChip}>{currentQuestion.skill_keyword}</Text>
            </View>
            <Pressable onPress={() => router.back()}>
              <Feather name="x" size={22} color="#94a3b8" />
            </Pressable>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          </View>

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
          <Text style={styles.heading}>Interview Complete!</Text>

          {results && (
            <View style={[styles.card, styles.scoreCard]}>
              <Text style={styles.gradeText}>{results.grade}</Text>
            </View>
          )}

          <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
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
  gateCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  gateTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b", textAlign: "center" },
  gateSub: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  cefrBadge: { fontSize: 14, color: "#4f46e5", fontWeight: "600", marginTop: 4 },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  progressText: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  skillChip: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  questionText: { fontSize: 18, fontWeight: "600", color: "#1e293b", lineHeight: 28 },
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
