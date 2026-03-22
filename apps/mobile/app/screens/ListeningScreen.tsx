import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { fetchListeningAssessments, fetchListeningAssessment, createListeningAttempt, submitListeningAttempt } from "@/services/listening-service";
import { ListeningAssessment, ListeningQuestion } from "@/services/listening-service";
import { setAssessmentResult } from "@/services/results-service";

export default function ListeningScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<"loading" | "assessments" | "attempt" | "submission">("loading");
  const [assessments, setAssessments] = useState<ListeningAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<ListeningAssessment | null>(null);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchListeningAssessments(true);
      setAssessments(data);
      setScreen("assessments");
    } catch (err: any) {
      setError(err.message || "Failed to load assessments");
      setScreen("assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAssessment = async (assessment: ListeningAssessment) => {
    try {
      setIsLoading(true);
      setError(null);
      const assessmentData = await fetchListeningAssessment(assessment.id);
      setSelectedAssessment(assessmentData);
      setQuestions(assessmentData.questions);
      const attempt = await createListeningAttempt();
      setAttemptId(attempt.id);
      setSelected({});
      setScreen("attempt");
    } catch (err: any) {
      setError(err.message || "Failed to load assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    setIsPlaying((prev) => !prev);
  };

  const setAnswer = (id: string, optionId: string) => {
    setSelected((prev) => ({ ...prev, [id]: optionId }));
  };

  const allAnswered = Object.keys(selected).length === questions.length;

  const handleNext = async () => {
    if (!attemptId || !allAnswered) return;

    try {
      setIsLoading(true);
      setError(null);
      const answers = Object.entries(selected).map(([questionId, selectedOptionId]) => ({
        question_id: questionId,
        selected_option_id: selectedOptionId,
      }));
      const response = await submitListeningAttempt(attemptId, answers);
      
      // Calculate marks based on correct answers
      let obtainedMarks = 0;
      let totalMarks = 0;
      
      if (response && response.correct_count !== undefined) {
        obtainedMarks = response.correct_count;
        totalMarks = questions.length;
      } else {
        // Fallback: calculate from questions
        questions.forEach(q => {
          totalMarks += q.points || 1;
          const userAnswer = selected[q.id!];
          const correctOption = q.options.find(opt => opt.is_correct);
          if (userAnswer === correctOption?.id) {
            obtainedMarks += q.points || 1;
          }
        });
      }

      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
      
      // Store result
      setAssessmentResult({
        type: "listening",
        title: selectedAssessment?.title || "Listening Assessment",
        totalMarks,
        obtainedMarks,
        percentage,
        isPassed: percentage >= 60,
      });

      // Navigate to writing assessment
      router.push("/write");
    } catch (err: any) {
      setError(err.message || "Failed to submit answers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/write");
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
          <Text style={styles.title}>Listening Assessments</Text>
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
          <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
            <Text style={styles.audioBtnText}>{isPlaying ? "Pause Audio" : "Play Audio"}</Text>
          </TouchableOpacity>
          <Text style={styles.audioInfo}>
            {selectedAssessment?.audio_duration_seconds 
              ? `Audio length: ${selectedAssessment.audio_duration_seconds}s`
              : "Tap Play to hear the audio passage."}
          </Text>

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

                {item.options.map((option) => (
                  <TouchableOpacity
                    key={option.id || ""}
                    style={[
                      styles.choiceButton,
                      selected[item.id!] === option.id && styles.choiceSelected,
                    ]}
                    onPress={() => setAnswer(item.id!, option.id!)}
                  >
                    <Text
                      style={
                        selected[item.id!] === option.id
                          ? styles.choiceTextSelected
                          : styles.choiceText
                      }
                    >
                      {option.option_text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.btnSmall, (!allAnswered || isLoading) && styles.disabled]}
            disabled={!allAnswered || isLoading}
            onPress={handleNext}
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
  audioBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12
  },
  audioBtnText: { color: "#fff", fontWeight: "bold" },
  choiceButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8
  },
  choiceSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF"
  },
  choiceText: { color: "#333" },
  choiceTextSelected: { color: "#4F46E5", fontWeight: "bold" },
  audioInfo: { marginBottom: 16, color: "#555", fontSize: 14 },
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
    backgroundColor: "blue",
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