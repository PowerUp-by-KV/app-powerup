import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  getNextRouteForSection,
  ReadingSectionResponse,
} from "@/services/assessment-api";
import { ReadingQuestion as ReadingQuestionComponent } from "./components/ReadingQuestion";
import { ParagraphDisplay } from "./components/ParagraphDisplay";
import { MCQOption } from "./components/ReadingMCQOption";
import { FillBlankInput } from "./components/FillBlankInput";
import { getAssessmentSessionId } from "@/services/auth-storage";

interface ReadingScreenProps {
  sessionId?: string;
}

export function ReadingScreen({ sessionId: propSessionId }: ReadingScreenProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | undefined>(propSessionId);

  useEffect(() => {
    if (!sessionId) {
      getAssessmentSessionId().then((id) => {
        if (id) setSessionId(id);
      });
    }
  }, [sessionId]);

  const {
    data: sectionData,
    isLoading,
    isError,
    refetch,
  } = useGetAssessmentSectionQuery(
    { session_id: sessionId!, section: "A_READING" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const readingData = sectionData as ReadingSectionResponse | undefined;
  const questions = readingData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes total
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60); // 60 seconds per question
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (sectionData) {
      setIsRunning(true);
    }
  }, [sectionData]);

  // Reset per-question timer
  useEffect(() => {
    setQuestionTimeLeft(60);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (!isRunning || isSubmitting) return;

    if (timeLeft <= 0 || questionTimeLeft <= 0) {
      if (isLastQuestion) {
        handleFinish();
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      setQuestionTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, questionTimeLeft, isLastQuestion, isSubmitting]);

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg font-bold text-slate-800 text-center mb-2">
          Connection Timeout
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          Could not load reading section due to network delay. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-indigo-600 px-6 py-3 rounded-xl shadow-sm"
        >
          <Text className="text-white font-semibold">Retry Loading Questions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading || !sectionData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>No questions found for this section.</Text>
      </View>
    );
  }

  const currentAnswer = answers[currentQuestion.id] || "";
  const isMCQ = currentQuestion.options && currentQuestion.options.length > 0;
  const progressText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const selectAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleFinish = async () => {
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        answer: val,
      }));

      let response: any = null;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await submitSection({
            session_id: sessionId!,
            section: "A_READING",
            data: { answers: formattedAnswers },
          }).unwrap();
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise((res) => setTimeout(res, 1000));
        }
      }

      // Brief delay to allow dev tunnel proxy socket to clean up before loading next route
      await new Promise((res) => setTimeout(res, 600));

      const nextRoute = getNextRouteForSection(response.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch {
      Alert.alert("Error", "Could not submit answers. Please try again.");
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish();
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
    // Disallow going back to previous sections (router.back())
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-4 py-4">
            <View className="rounded-3xl bg-slate-100 p-4 mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-sm text-slate-500">{progressText}</Text>
                <Text className="text-sm text-indigo-600 font-semibold">Section: {timerLabel}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-slate-400">Total Progress</Text>
                <Text className="text-xs text-red-500 font-bold">
                  Question ends in: {questionTimeLeft}s
                </Text>
              </View>
            </View>

            {readingData?.paragraph && (
              <ParagraphDisplay paragraph={readingData.paragraph} topic="Reading Comprehension" />
            )}

            <ReadingQuestionComponent
              question={currentQuestion.question || ""}
              questionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              timeLeft={questionTimeLeft}
            />

            <View className="mt-4">
              {isMCQ && currentQuestion.options ? (
                currentQuestion.options.map((option: any, idx: number) => {
                  return (
                    <MCQOption
                      key={idx}
                      label={option.label || String.fromCharCode(65 + idx)}
                      text={option.value}
                      isSelected={currentAnswer === option.value}
                      onSelect={() => selectAnswer(option.value)}
                    />
                  );
                })
              ) : (
                <FillBlankInput
                  value={currentAnswer}
                  placeholder="Type your answer here..."
                  onChange={(text: string) => selectAnswer(text)}
                />
              )}
            </View>

            <View className="flex-row justify-between mt-8 gap-3 mb-8">
              {currentQuestionIndex > 0 && (
                <TouchableOpacity
                  className="flex-1 bg-gray-500 py-3 rounded-lg items-center"
                  onPress={handleBack}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold">Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg items-center ${isSubmitting ? "bg-indigo-400" : "bg-indigo-600"}`}
                onPress={handleNext}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">
                    {isLastQuestion ? "Submit Assessment" : "Next Question"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
