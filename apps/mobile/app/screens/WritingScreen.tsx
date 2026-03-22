import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { fetchGrammarAssessments, fetchGrammarAssessment, createGrammarAttempt, submitGrammarAttempt } from "@/services/grammar-service";
import { GrammarAssessment, GrammarQuestion } from "@/services/grammar-service";
import { setAssessmentResult } from "@/services/results-service";

export default function WritingScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<"loading" | "assessments" | "attempt" | "submission">("loading");
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
      setScreen("assessments");
    } catch (err: any) {
      setError(err.message || "Failed to load assessments");
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
      const attempt = await createGrammarAttempt();
      setAttemptId(attempt.id);
      setAnswers({});
      setScreen("attempt");
    } catch (err: any) {
      setError(err.message || "Failed to load assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (id: string, text: string) => {
    setAnswers({ ...answers, [id]: text });
  };

  const allAnswered = Object.keys(answers).length === questions.length && Object.values(answers).every(a => a.trim().length > 0);

  const handleSubmit = async () => {
    if (!attemptId || !allAnswered) return;

    try {
      setIsLoading(true);
      setError(null);
      const submissionAnswers = Object.entries(answers).map(([questionId, text]) => ({
        question_id: questionId,
        answer_text: text,
      }));
      await submitGrammarAttempt(attemptId, submissionAnswers);
      
      // For essay/writing assessments, calculate based on question count
      // In a real scenario, you might get scores from the backend
      const totalMarks = questions.length * 10; // 10 marks per question
      const obtainedMarks = Math.round(totalMarks * 0.75); // Default 75% for submission
      const percentage = 75;
      
      // Store result
      setAssessmentResult({
        type: "writing",
        title: selectedAssessment?.title || "Grammar Assessment",
        totalMarks,
        obtainedMarks,
        percentage,
        isPassed: percentage >= 60,
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
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={assessments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
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
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={questions}
            keyExtractor={(item) => item.id || ""}
            renderItem={({ item, index }) => (
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
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
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
    textAlignVertical: "top"
  },
  list: { flexGrow: 1 },
  listContent: { paddingBottom: 16 },
  assessmentItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f9f9f9"
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
    borderRadius: 5
  },
  btnSmall: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 6,
    alignSelf: "flex-end",
    marginTop: 12
  },
  btnContinue: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  disabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontWeight: "bold" }
});