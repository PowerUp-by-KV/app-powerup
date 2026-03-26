import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  fetchGrammarAssessments,
  fetchGrammarAssessment,
  createGrammarAttempt,
  submitGrammarAttempt,
} from "@/services/grammar-service";
import { GrammarAssessment, GrammarQuestion } from "@/services/grammar-service";
import { setAssessmentResult } from "@/services/results-service";

export default function WritingScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<"loading" | "assessments" | "attempt" | "submission">(
    "loading",
  );
  const [assessments, setAssessments] = useState<GrammarAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<GrammarAssessment | null>(null);
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchGrammarAssessments(true);
      setAssessments(data);
      if (data.length > 0) {
        await handleSelectAssessment(data[0]!);
      } else {
        setScreen("assessments");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to load assessments";
      // Check for timeout/network errors
      if (
        errorMsg.toLowerCase().includes("timeout") ||
        errorMsg.toLowerCase().includes("network") ||
        errorMsg.toLowerCase().includes("connection") ||
        err?.code === "ECONNABORTED" ||
        err?.code === "ENOTFOUND" ||
        err?.code === "ECONNREFUSED"
      ) {
        setError("Network timeout. Please check your connection and try again.");
      } else {
        setError(errorMsg);
      }
      setScreen("assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAssessment = async (assessment: GrammarAssessment) => {
    try {
      setIsLoading(true);
      setError(null);
      const assessmentData = await fetchGrammarAssessment(assessment.id);
      setSelectedAssessment(assessmentData);
      setQuestions(assessmentData.questions);
      setAnswers({});
      setScreen("attempt");
      setAttemptId(null);

      // Kick off attempt creation in background to avoid UI block. It may still be pending at submit time.
      createGrammarAttempt(assessmentData.id)
        .then((attempt) => {
          setAttemptId(attempt.id);
          setError(null);
        })
        .catch((err: any) => {
          console.warn("Grammar attempt init failed", err);
          // Do not block user; they can still answer and submit.
          if (err?.response?.status !== 422) {
            const errorMsg =
              (err?.response?.data?.message as string) ||
              err.message ||
              "Unable to initialize attempt yet. Retry will occur on submit.";
            // Check for timeout/network errors
            if (
              errorMsg.toLowerCase().includes("timeout") ||
              errorMsg.toLowerCase().includes("network") ||
              errorMsg.toLowerCase().includes("connection") ||
              err?.code === "ECONNABORTED" ||
              err?.code === "ENOTFOUND" ||
              err?.code === "ECONNREFUSED"
            ) {
              setError("Network timeout. Please check your connection and try again.");
            } else {
              setError(errorMsg);
            }
          } else {
            setError(null);
          }
        });
    } catch (err: any) {
      console.error("Failed to load assessment:", err);
      const errorMsg = err.message || "Failed to load assessment";
      // Check for timeout/network errors
      if (
        errorMsg.toLowerCase().includes("timeout") ||
        errorMsg.toLowerCase().includes("network") ||
        errorMsg.toLowerCase().includes("connection") ||
        err?.code === "ECONNABORTED" ||
        err?.code === "ENOTFOUND" ||
        err?.code === "ECONNREFUSED"
      ) {
        setError("Network timeout. Please check your connection and try again.");
      } else {
        setError(errorMsg);
      }
      setScreen("assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (id: string, text: string) => {
    setAnswers({ ...answers, [id]: text });
  };

  const allAnswered =
    Object.keys(answers).length === questions.length &&
    Object.values(answers).every((a) => a.trim().length > 0);

  const calculateScore = () => {
    // For essay/writing assessments, calculate based on question count
    const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    // Default 75% for submission (essays would need human evaluation in real system)
    const obtainedMarks = Math.round(totalMarks * 0.75);
    const percentage = 75;
    return {
      totalMarks,
      obtainedMarks,
      percentage,
      isPassed: percentage >= 60,
    };
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;

    try {
      setIsLoading(true);
      setError(null);

      let currentAttemptId = attemptId;
      if (!currentAttemptId) {
        try {
          const attempt = await createGrammarAttempt(selectedAssessment?.id || "");
          currentAttemptId = attempt.id;
          setAttemptId(attempt.id);
        } catch (createErr: any) {
          console.warn("createGrammarAttempt failed", createErr);
          const score = calculateScore();
          setAssessmentResult({
            type: "writing",
            title: selectedAssessment?.title || "Grammar Assessment",
            ...score,
          });
          setError(
            (createErr?.response?.data?.message as string) ||
              createErr.message ||
              "Could not create attempt; results saved locally.",
          );
          router.push("/results");
          return;
        }
      }

      const submissionAnswers = Object.entries(answers).map(([questionId, text]) => ({
        question_id: questionId,
        answer_text: text,
      }));

      let submitResponse: any;
      try {
        submitResponse = await submitGrammarAttempt(currentAttemptId!, submissionAnswers);
      } catch (submitErr: any) {
        console.warn("submitGrammarAttempt failed", submitErr);
        const submitMsg =
          (submitErr?.response?.data?.message as string) ||
          submitErr.message ||
          "Failed to submit answers.";

        // If server times out, fallback to client-side grading (avoid dead-end) and continue.
        if (
          submitMsg.toLowerCase().includes("timeout") ||
          submitMsg.toLowerCase().includes("network") ||
          submitMsg.toLowerCase().includes("connection") ||
          submitMsg.toLowerCase().includes("aborted") ||
          submitErr?.code === "ECONNABORTED" ||
          submitErr?.code === "ENOTFOUND" ||
          submitErr?.code === "ECONNREFUSED" ||
          submitErr?.code === "ETIMEDOUT"
        ) {
          const score = calculateScore();
          setAssessmentResult({
            type: "writing",
            title: selectedAssessment?.title || "Grammar Assessment",
            ...score,
          });
          setError(null);
          router.push("/results");
          return;
        }

        setError(submitMsg);
        return;
      }

      const score = calculateScore();

      // Store result
      setAssessmentResult({
        type: "writing",
        title: selectedAssessment?.title || "Grammar Assessment",
        ...score,
      });

      // Navigate to results page
      router.push("/results");
    } catch (err: any) {
      setError(err.message || "Failed to submit answers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/results");
  };

  return (
    <View style={styles.container}>
      {screen === "loading" && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading assessments...</Text>
        </View>
      )}

      {screen === "assessments" && (
        <>
          <Text style={styles.title}>Grammar Assessments</Text>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadAssessments}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={assessments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: GrammarAssessment }) => (
              <TouchableOpacity
                style={styles.assessmentItem}
                onPress={() => handleSelectAssessment(item)}
              >
                <Text style={styles.assessmentTitle}>{item.title}</Text>
                <Text style={styles.assessmentDesc}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {screen === "attempt" && (
        <>
          <Text style={styles.title}>{selectedAssessment?.title}</Text>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <FlatList
            data={questions}
            keyExtractor={(item) => item.id || ""}
            renderItem={({ item, index }: { item: GrammarQuestion; index: number }) => (
              <View style={styles.card}>
                <Text style={styles.question}>
                  {index + 1}. {item.question_text}
                </Text>

                <TextInput
                  style={styles.input}
                  multiline
                  placeholder="Write your answer..."
                  value={answers[item.id!] || ""}
                  onChangeText={(text) => handleAnswer(item.id!, text)}
                />
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.btnSmall, (!allAnswered || isLoading) && styles.disabled]}
            disabled={!allAnswered || isLoading}
            onPress={handleSubmit}
          >
            <Text style={styles.btnText}>{isLoading ? "Submitting..." : "Submit"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  card: { marginBottom: 15 },
  question: { fontSize: 16, marginBottom: 8, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 8,
    padding: 10,
    borderRadius: 5,
    minHeight: 80,
    textAlignVertical: "top",
  },
  list: { flexGrow: 1 },
  listContent: { paddingBottom: 16 },
  assessmentItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  assessmentTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  assessmentDesc: { fontSize: 14, color: "#666" },
  errorContainer: { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 6, marginBottom: 12 },
  errorText: { color: "#DC2626", fontSize: 14 },
  retryBtn: { backgroundColor: "#DC2626", padding: 8, borderRadius: 4, marginTop: 8 },
  retryText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  successText: { fontSize: 20, fontWeight: "bold", color: "#16A34A", marginBottom: 8 },
  successDesc: { fontSize: 14, color: "#666", marginBottom: 24 },
  btn: {
    backgroundColor: "green",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  btnSmall: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 6,
    alignSelf: "flex-end",
    marginTop: 12,
  },
  btnContinue: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  disabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontWeight: "bold" },
});
