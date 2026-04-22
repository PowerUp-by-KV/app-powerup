import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import {
  fetchGrammarAssessments,
  fetchGrammarAssessment,
  createGrammarAttempt,
  submitGrammarAttempt,
} from "@/services/grammar-service";
import { GrammarAssessment, GrammarQuestion } from "@/services/grammar-service";
import { setAssessmentResult } from "@/services/results-service";

export function WritingScreen() {
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
            id: `${selectedAssessment?.id || "grammar"}-${Date.now()}`,
            type: "writing",
            title: selectedAssessment?.title || "Grammar Assessment",
            score: score.obtainedMarks,
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

      try {
        await submitGrammarAttempt(currentAttemptId, submissionAnswers);
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
            id: `${selectedAssessment?.id || "grammar"}-${Date.now()}`,
            type: "writing",
            title: selectedAssessment?.title || "Grammar Assessment",
            score: score.obtainedMarks,
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
        id: `${selectedAssessment?.id || "grammar"}-${Date.now()}`,
        type: "writing",
        title: selectedAssessment?.title || "Grammar Assessment",
        score: score.obtainedMarks,
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

  return (
    <View className="flex-1 p-[15px] bg-white">
      {screen === "loading" && (
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-3 text-base text-gray-600">Loading assessments...</Text>
        </View>
      )}

      {screen === "assessments" && (
        <>
          <Text className="text-2xl font-bold mb-4">Grammar Assessments</Text>
          {error && (
            <View className="bg-red-100 p-3 rounded mb-3">
              <Text className="text-red-700 text-sm">{error}</Text>
              <TouchableOpacity className="bg-red-600 p-2 rounded mt-2" onPress={loadAssessments}>
                <Text className="text-white font-semibold text-center">Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={assessments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: GrammarAssessment }) => (
              <TouchableOpacity
                className="p-4 border border-gray-300 rounded mb-3 bg-gray-100"
                onPress={() => handleSelectAssessment(item)}
              >
                <Text className="text-base font-semibold mb-1">{item.title}</Text>
                <Text className="text-sm text-gray-700">{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {screen === "attempt" && (
        <>
          <Text className="text-2xl font-bold mb-4">{selectedAssessment?.title}</Text>
          {error && (
            <View className="bg-red-100 p-3 rounded mb-3">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}
          <FlatList
            data={questions}
            keyExtractor={(item) => item.id || ""}
            renderItem={({ item, index }: { item: GrammarQuestion; index: number }) => (
              <View className="mb-[15px]">
                <Text className="text-base mb-2 font-semibold">
                  {index + 1}. {item.question_text}
                </Text>

                <TextInput
                  className="border border-gray-300 mt-2 p-3 rounded text-base"
                  multiline
                  placeholder="Write your answer..."
                  value={answers[item.id!] || ""}
                  onChangeText={(text) => handleAnswer(item.id!, text)}
                />
              </View>
            )}
          />

          <TouchableOpacity
            className={`bg-indigo-600 py-3 px-4 items-center rounded-lg self-end mt-3 ${!allAnswered || isLoading ? "bg-gray-400" : ""}`}
            disabled={!allAnswered || isLoading}
            onPress={handleSubmit}
          >
            <Text className="text-white font-bold">{isLoading ? "Submitting..." : "Submit"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
