import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { clearAuthSession } from "@/services/auth-storage";
import {
  fetchAssessments,
  fetchAssessment,
  createReadingAttempt,
  submitReadingAttempt,
} from "@/services/reading-service";
import { Assessment, Question } from "@/services/reading-service";
import { setAssessmentResult } from "@/services/results-service";

export default function ReadingScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<"loading" | "assessments" | "attempt" | "submission">(
    "loading",
  );
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<number>(0);
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
      const data = await fetchAssessments();
      setAssessments(data);
      if (data.length > 0) {
        await handleSelectAssessment(data[0]!);
      } else {
        setScreen("assessments");
      }
    } catch (err: any) {
      console.error("Assessments Error:", err.response?.data || err.message);
      const errorMsg = getErrorMessage(err);

      if (err?.response?.status === 401) {
        setError(errorMsg);
        redirectToLogin();
        return;
      }

      setError(errorMsg);
      setScreen("assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAssessment = async (assessment: Assessment) => {
    try {
      setIsLoading(true);
      setError(null);
      const assessmentData = await fetchAssessment(assessment.id);
      setSelectedAssessment(assessmentData);
      setQuestions(assessmentData.questions);
      setSelected({});
      setScreen("attempt");
      setAttemptId(null);
      setAttemptNumber(0);

      // Kick off attempt creation in background to avoid UI block. It may still be pending at submit time.
      createReadingAttempt(assessmentData.id)
        .then((attempt) => {
          setAttemptId(attempt.id);
          setAttemptNumber((prev) => (prev || 0) + 1);
          setError(null);
        })
        .catch((err: any) => {
          console.warn("Reading attempt init failed", err);
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
      const errorMsg = getErrorMessage(err);

      if (err?.response?.status === 401) {
        setError(errorMsg);
        redirectToLogin();
        return;
      }

      setError(errorMsg);
      setScreen("assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const setAnswer = (id: string, optionId: string) => {
    setSelected((prev) => ({ ...prev, [id]: optionId }));
  };

  const allAnswered = Object.keys(selected).length === questions.length;

  const calculateScore = () => {
    const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const obtainedMarks = questions.reduce((sum, q) => {
      const userAnswer = selected[q.id!];
      const correctOption = q.options.find((opt) => opt.is_correct);
      return sum + (userAnswer === correctOption?.id ? q.points || 1 : 0);
    }, 0);

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    return {
      totalMarks,
      obtainedMarks,
      percentage,
      isPassed: percentage >= 60,
    };
  };

  const getErrorMessage = (err: any): string => {
    if (err?.response?.status === 401) {
      return "Session expired or unauthorized. Please login again.";
    }

    const errorMsg = err?.response?.data?.message || err?.message || "Failed to load data";

    if (
      errorMsg.toString().toLowerCase().includes("timeout") ||
      errorMsg.toString().toLowerCase().includes("network") ||
      errorMsg.toString().toLowerCase().includes("connection") ||
      err?.code === "ECONNABORTED" ||
      err?.code === "ENOTFOUND" ||
      err?.code === "ECONNREFUSED" ||
      err?.code === "ETIMEDOUT"
    ) {
      return "Network timeout. Please check your connection and try again.";
    }

    return errorMsg;
  };

  const redirectToLogin = () => {
    clearAuthSession().finally(() => {
      router.replace("/(auth)/login");
    });
  };

  const handleNext = async () => {
    if (!allAnswered) return;

    try {
      setIsLoading(true);
      setError(null);

      let currentAttemptId = attemptId;
      if (!currentAttemptId) {
        try {
          const attempt = await createReadingAttempt(selectedAssessment?.id || "");
          currentAttemptId = attempt.id;
          setAttemptId(attempt.id);
          setAttemptNumber((prev) => (prev || 0) + 1);
        } catch (createErr: any) {
          console.warn("createReadingAttempt failed", createErr);
          const score = calculateScore();
          setAssessmentResult({
            type: "reading",
            title: selectedAssessment?.title || "Reading Assessment",
            ...score,
          });
          setError(
            (createErr?.response?.data?.message as string) ||
              createErr.message ||
              "Could not create attempt; results saved locally.",
          );
          router.push("/listen");
          return;
        }
      }

      const answers = Object.entries(selected).map(([questionId, selectedOptionId]) => ({
        question_id: questionId,
        selected_option_id: selectedOptionId,
      }));

      let response: any;
      try {
        response = await submitReadingAttempt(currentAttemptId!, answers);
      } catch (submitErr: any) {
        console.warn("submitReadingAttempt failed", submitErr);
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
            type: "reading",
            title: selectedAssessment?.title || "Reading Assessment",
            ...score,
          });
          setError(null);
          router.push("/listen");
          return;
        }

        setError(submitMsg);
        return;
      }

      // Calculate marks based on correct answers
      let obtainedMarks = 0;
      let totalMarks = 0;

      if (response && response.correct_count !== undefined) {
        obtainedMarks = response.correct_count;
        totalMarks = questions.length;
      } else {
        // Fallback: calculate from questions
        questions.forEach((q) => {
          totalMarks += q.points || 1;
          const userAnswer = selected[q.id!];
          const correctOption = q.options.find((opt) => opt.is_correct);
          if (userAnswer === correctOption?.id) {
            obtainedMarks += q.points || 1;
          }
        });
      }

      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

      // Store result
      setAssessmentResult({
        type: "reading",
        title: selectedAssessment?.title || "Reading Assessment",
        totalMarks,
        obtainedMarks,
        percentage,
        isPassed: percentage >= 60, // 60% pass threshold
      });

      // Navigate to listening assessment
      router.push("/listen");
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      if (err?.response?.status === 401) {
        setError(errorMsg);
        redirectToLogin();
      } else {
        setError(errorMsg);
      }
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
          <Text className="text-2xl font-bold mb-4">Reading Assessments</Text>
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
            renderItem={({ item }: { item: Assessment }) => (
              <TouchableOpacity
                className="p-4 border border-gray-300 rounded mb-3 bg-gray-100"
                onPress={() => handleSelectAssessment(item)}
              >
                <Text className="text-base font-semibold mb-1">{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {screen === "attempt" && (
        <>
          <Text className="text-2xl font-bold mb-4">{selectedAssessment?.title}</Text>
          {attemptId ? (
            <Text className="text-blue-900 text-sm mb-2">
              Attempt {attemptNumber} started (ID: {attemptId})
            </Text>
          ) : (
            !isLoading && (
              <Text className="text-blue-900 text-sm mb-2">
                Starting your reading attempt. If this takes more than a few seconds, please retry.
              </Text>
            )
          )}
          {error && (
            <View className="bg-red-100 p-3 rounded mb-3">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}
          {selectedAssessment?.passage_text && (
            <View className="mb-[15px]">
              <Text className="text-base mb-4 text-gray-800">
                {selectedAssessment.passage_text}
              </Text>
            </View>
          )}
          <FlatList
            data={questions}
            keyExtractor={(item) => item.id || ""}
            renderItem={({ item, index }: { item: Question; index: number }) => (
              <View className="mb-[15px]">
                <Text className="text-base mb-2 font-semibold">
                  {index + 1}. {item.question_text}
                </Text>

                {item.options.map((option: any) => (
                  <TouchableOpacity
                    key={option.id || ""}
                    className={`border border-gray-300 rounded py-[10px] px-3 mb-2 ${
                      selected[item.id!] === option.id ? "border-indigo-600 bg-indigo-100" : ""
                    }`}
                    onPress={() => setAnswer(item.id!, option.id!)}
                  >
                    <Text
                      className={`${
                        selected[item.id!] === option.id
                          ? "text-indigo-600 font-bold"
                          : "text-gray-800"
                      }`}
                    >
                      {option.option_text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <TouchableOpacity
            className={`bg-indigo-600 py-3 px-4 items-center rounded-lg self-end mt-3 ${!allAnswered || isLoading ? "bg-gray-400" : ""}`}
            disabled={!allAnswered || isLoading}
            onPress={handleNext}
          >
            <Text className="text-white font-bold">{isLoading ? "Submitting..." : "Submit"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
