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
import { AssessmentHeader } from "./components/AssessmentHeader";
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
  const [isFinished, setIsFinished] = useState(false);

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
    if (!isRunning || isSubmitting || isFinished) return;

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
  }, [isRunning, timeLeft, questionTimeLeft, isLastQuestion, isSubmitting, isFinished]);

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

  const selectAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleFinish = async () => {
    setIsFinished(true);
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
            <AssessmentHeader
              sectionName="Section A"
              skillName="Reading Skills"
              currentQuestion={currentQuestionIndex}
              totalQuestions={questions.length}
              onFinishTest={handleFinish}
              sessionId={sessionId}
            />

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

            <View className="flex-row justify-between mt-8 gap-4 mb-8">
              {currentQuestionIndex > 0 && (
                <TouchableOpacity
                  className="flex-1 bg-slate-200 py-4 rounded-2xl items-center shadow-sm"
                  onPress={handleBack}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text className="text-slate-700 font-bold text-base">Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl items-center shadow-md ${
                  isSubmitting ? "bg-slate-400" : "bg-slate-800"
                }`}
                onPress={handleNext}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    {isLastQuestion ? "Check Answers" : "Next Question"}
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
