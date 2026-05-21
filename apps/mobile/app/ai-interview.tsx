import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetProfileQuery } from "@/services/auth-api";
import { useGetResumeQuery } from "@/services/resume-api";
import { Audio } from "expo-av";
import {
  type QuestionOut,
  useStartPracticeSessionMutation,
  useFetchPracticeQuestionsQuery,
  useSubmitPracticeAnswerMutation,
  useGenerateInterviewReportMutation,
} from "@/services/practice-api";

export default function InterviewScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const userId = profile?.id;

  const { data: resume, isLoading: resumeLoading } = useGetResumeQuery(userId ?? "", { skip: !userId });

  const hasSkills = resume?.parse_status === "completed" && (resume.skills?.length ?? 0) > 0;

  // Practice flow state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionOut[]>([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const currentQuestion = questions[questionIdx] ?? null;

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AiAnswerResult | null>(null);

  const [startPractice, { isLoading: creating }] = useStartPracticeSessionMutation();
  const { data: fetchedQuestions } = useFetchPracticeQuestionsQuery(sessionId ?? "", {
    skip: !sessionId,
  });
  const [submitPracticeAnswer, { isLoading: submitting }] = useSubmitPracticeAnswerMutation();
  const [generateReport] = useGenerateInterviewReportMutation();

  // Start practice session
  const handleStart = async () => {
    try {
      const res = await startPractice().unwrap();
      setSessionId(res.session_id);
    } catch (e: any) {
      Alert.alert('Error', e?.data?.detail ?? 'Could not start practice session');
    }
  };

  // When sessionId is set, fetch the batch of questions
  useEffect(() => {
    if (fetchedQuestions) {
      setQuestions(fetchedQuestions);
      setQuestionIdx(0);
    }
  }, [fetchedQuestions]);

  // Recording helpers
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      console.error('Recording error', e);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri ?? null);
      setRecording(null);
    } catch (e) {
      console.error('Stop error', e);
    }
  };

  // Submit answer for current question
  const handleSubmit = async () => {
    if (!sessionId || !currentQuestion?.id || !audioUri) {
      Alert.alert('Missing data', 'Make sure a session, question and recording exist.');
      return;
    }
    try {
      const result = await submitPracticeAnswer({
        sessionId,
        questionId: currentQuestion.id,
        file: { uri: audioUri, name: "answer.wav", type: "audio/wav" },
      }).unwrap();
      setLastAnswer(result);
      // Move to next question or finish
      if (questionIdx + 1 < questions.length) {
        setQuestionIdx(questionIdx + 1);
        setAudioUri(null);
        setLastAnswer(null);
      } else {
        // All answered – generate report
        await generateReport(sessionId).unwrap();
        setQuestionIdx(questionIdx + 1); // keep index out of range to stop UI
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to submit answer');
    }
  };

  // UI rendering
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
              Interview Buddy generates questions from your real skills and experience. Upload your resume in the Resume Studio.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.push("/resume" as never)}>
              <Text style={styles.primaryBtnText}>Go to Resume Studio</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Initial screen – start button
  if (!sessionId) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#475569" />
          </Pressable>
          <Text style={styles.heading}>Interview Buddy</Text>
          <Text style={styles.sub}>Questions are generated from your resume skills. Ready when you are.</Text>
          <Pressable style={styles.primaryBtn} onPress={handleStart} disabled={creating}>
            {creating ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Start Interview</Text>}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Question screen
  if (currentQuestion && questionIdx < questions.length) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressText}>Q{questionIdx + 1} of {questions.length}</Text>
              <Text style={styles.skillChip}>Interview Practice</Text>
            </View>
            <Pressable onPress={() => router.back()}>
              <Feather name="x" size={22} color="#94a3b8" />
            </Pressable>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
          </View>

          <Text style={styles.label}>Your Answer (Audio)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Pressable
              style={[styles.primaryBtn, recording && styles.primaryBtnDisabled]}
              onPress={recording ? stopRecording : startRecording}
            >
              <Text style={styles.primaryBtnText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
            </Pressable>
            {audioUri && <Text style={{ marginLeft: 12, color: '#4f46e5' }}>Recorded</Text>}
          </View>

          <Pressable style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Submit Answer</Text>}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Answer review / results screen
  if (lastAnswer) {
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
          <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Fallback loading
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator style={{ marginTop: 80 }} />
    </SafeAreaView>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AiAnswerResult {
  score: number | null;
  feedback: string | null;
  score_breakdown: {
    criteria_scores: { name: string; score: number; feedback: string }[];
  } | null;
  questions_remaining: number;
  session_complete: boolean;
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
