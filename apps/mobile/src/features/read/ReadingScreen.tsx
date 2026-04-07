import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useRouter } from "expo-router";
import { clearAuthSession } from "@/services/auth-storage";
import {
  Assessment,
  ReadingQuestion,
  useCreateReadingAttemptMutation,
  useGetReadingAssessmentQuery,
  useGetReadingAssessmentsQuery,
  useSubmitReadingAttemptMutation,
} from "@/services/reading-api";
import { setAssessmentResult } from "@/services/results-service";

export function ReadingScreen() {
  const router = useRouter();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<number>(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: assessments,
    isLoading: isAssessmentsLoading,
    isError: isAssessmentsError,
    error: assessmentsError,
    refetch: refetchAssessments,
  } = useGetReadingAssessmentsQuery(undefined);

  const {
    data: selectedAssessment,
    isLoading: isAssessmentLoading,
    isError: isAssessmentError,
  } = useGetReadingAssessmentQuery(selectedAssessmentId ?? skipToken);

  const [createReadingAttempt] = useCreateReadingAttemptMutation();
  const [submitReadingAttempt] = useSubmitReadingAttemptMutation();

  useEffect(() => {
    if (assessments && assessments.length > 0 && !selectedAssessmentId) {
      setSelectedAssessmentId(assessments[0]!.id);
    }
  }, [assessments, selectedAssessmentId]);

  useEffect(() => {
    if (selectedAssessment) {
      setSelected({});
      setAttemptId(null);
      setAttemptNumber(0);
      setError(null);
      createReadingAttempt(selectedAssessment.id)
        .unwrap()
        .then((attempt) => {
          setAttemptId(attempt.id);
          setAttemptNumber((prev) => prev + 1);
        })
        .catch((err: any) => {
          console.warn("Reading attempt init failed", err);
        });
    }
  }, [selectedAssessment, createReadingAttempt]);

  const setAnswer = (id: string, optionId: string) => {
    setSelected((prev) => ({ ...prev, [id]: optionId }));
  };

  const allAnswered = selectedAssessment
    ? Object.keys(selected).length === selectedAssessment.questions.length
    : false;

  const calculateScore = () => {
    const questions = selectedAssessment?.questions || [];
    const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const obtainedMarks = questions.reduce((sum, q) => {
      const userAnswer = selected[q.id];
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
    if (err?.status === 401 || err?.response?.status === 401) {
      return "Session expired or unauthorized. Please login again.";
    }

    const errorMsg =
      (err?.data as any)?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load data";

    if (
      typeof errorMsg === "string" &&
      (errorMsg.toLowerCase().includes("timeout") ||
        errorMsg.toLowerCase().includes("network") ||
        errorMsg.toLowerCase().includes("connection") ||
        err?.code === "ECONNABORTED" ||
        err?.code === "ENOTFOUND" ||
        err?.code === "ECONNREFUSED" ||
        err?.code === "ETIMEDOUT")
    ) {
      return "Network timeout. Please check your connection and try again.";
    }

    return String(errorMsg);
  };

  const redirectToLogin = () => {
    clearAuthSession().finally(() => {
      router.replace("/login");
    });
  };

  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setError(null);
  };

  const handleNext = async () => {
    if (!allAnswered || !selectedAssessment) return;

    setIsSubmitting(true);
    setError(null);

    let currentAttemptId = attemptId;
    if (!currentAttemptId) {
      try {
        const attempt = await createReadingAttempt(selectedAssessment.id).unwrap();
        currentAttemptId = attempt.id;
        setAttemptId(attempt.id);
        setAttemptNumber((prev) => prev + 1);
      } catch (createErr: any) {
        const score = calculateScore();
        setAssessmentResult({
          id: `${selectedAssessment.id}-${Date.now()}`,
          type: "reading",
          title: selectedAssessment.title,
          score: score.obtainedMarks,
          ...score,
        });
        setError(
          (createErr?.data as any)?.message ||
            createErr.message ||
            "Could not create attempt; results saved locally.",
        );
        router.push("/listen");
        setIsSubmitting(false);
        return;
      }
    }

    const answers = Object.entries(selected).map(([questionId, selectedOptionId]) => ({
      question_id: questionId,
      selected_option_id: selectedOptionId,
    }));

    try {
      const response = await submitReadingAttempt({
        attempt_id: currentAttemptId,
        answers,
      }).unwrap();
      let obtainedMarks = response.score;
      let totalMarks = selectedAssessment.questions.length;
      const percentage = response.percentage;
      const isPassed = response.is_passed;

      setAssessmentResult({
        id: `${selectedAssessment.id}-${Date.now()}`,
        type: "reading",
        title: selectedAssessment.title,
        totalMarks,
        obtainedMarks,
        percentage,
        isPassed: percentage >= 60,
        score: obtainedMarks,
      });
      router.push("/listen");
    } catch (submitErr: any) {
      const submitMsg =
        (submitErr?.data as any)?.message || submitErr.message || "Failed to submit answers.";
      if (
        typeof submitMsg === "string" &&
        (submitMsg.toLowerCase().includes("timeout") ||
          submitMsg.toLowerCase().includes("network") ||
          submitMsg.toLowerCase().includes("connection") ||
          submitErr?.code === "ECONNABORTED" ||
          submitErr?.code === "ENOTFOUND" ||
          submitErr?.code === "ECONNREFUSED" ||
          submitErr?.code === "ETIMEDOUT")
      ) {
        const score = calculateScore();
        setAssessmentResult({
          id: `${selectedAssessment.id}-${Date.now()}`,
          type: "reading",
          title: selectedAssessment.title,
          score: score.obtainedMarks,
          ...score,
        });
        router.push("/listen");
      } else if (submitErr?.status === 401 || submitErr?.response?.status === 401) {
        setError(getErrorMessage(submitErr));
        redirectToLogin();
      } else {
        setError(String(submitMsg));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isAssessmentsLoading || isAssessmentLoading;

  if (isAssessmentsError || isAssessmentError) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <Text className="text-red-700 text-lg font-bold mb-3">Unable to load reading content</Text>
        <TouchableOpacity className="bg-indigo-600 px-4 py-3 rounded" onPress={refetchAssessments}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-[15px] bg-white">
      {isLoading && !selectedAssessment && (
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-3 text-base text-gray-600">Loading assessments...</Text>
        </View>
      )}

      {!isLoading && (
        <>
          <Text className="text-2xl font-bold mb-4">Reading Assessments</Text>

          {error && (
            <View className="bg-red-100 p-3 rounded mb-3">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          <FlatList
            data={assessments || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: Assessment }) => (
              <TouchableOpacity
                className={`p-4 border rounded mb-3 ${
                  item.id === selectedAssessmentId
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 bg-gray-100"
                }`}
                onPress={() => handleSelectAssessment(item.id)}
              >
                <Text className="text-base font-semibold mb-1">{item.title}</Text>
                <Text className="text-sm text-gray-700">{item.description}</Text>
              </TouchableOpacity>
            )}
          />

          {selectedAssessment && (
            <>
              <Text className="text-2xl font-bold mb-4">{selectedAssessment.title}</Text>
              {selectedAssessment.passage_text && (
                <View className="mb-[15px]">
                  <Text className="text-base mb-4 text-gray-800">
                    {selectedAssessment.passage_text}
                  </Text>
                </View>
              )}
              {attemptId ? (
                <Text className="text-blue-900 text-sm mb-2">
                  Attempt {attemptNumber} started (ID: {attemptId})
                </Text>
              ) : (
                !isSubmitting && (
                  <Text className="text-blue-900 text-sm mb-2">
                    Starting your reading attempt. If this takes more than a few seconds, please
                    retry.
                  </Text>
                )
              )}
              <FlatList
                data={selectedAssessment.questions}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }: { item: ReadingQuestion; index: number }) => (
                  <View className="mb-[15px]">
                    <Text className="text-base mb-2 font-semibold">
                      {index + 1}. {item.question_text}
                    </Text>
                    {item.options.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        className={`border border-gray-300 rounded py-[10px] px-3 mb-2 ${
                          selected[item.id] === option.id ? "border-indigo-600 bg-indigo-100" : ""
                        }`}
                        onPress={() => setAnswer(item.id, option.id)}
                      >
                        <Text
                          className={`${
                            selected[item.id] === option.id
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
                className={`bg-indigo-600 py-3 px-4 items-center rounded-lg self-end mt-3 ${
                  !allAnswered || isSubmitting ? "bg-gray-400" : ""
                }`}
                disabled={!allAnswered || isSubmitting}
                onPress={handleNext}
              >
                <Text className="text-white font-bold">
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
}
