/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
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
  useLazyGetAssessmentStatusQuery,
} from "@/services/assessment-api";
import { ReadingQuestion as ReadingQuestionComponent } from "./components/ReadingQuestion";
import { ParagraphDisplay } from "./components/ParagraphDisplay";
import { MCQOption } from "./components/ReadingMCQOption";
import { FillBlankInput } from "./components/FillBlankInput";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import LottieView from "lottie-react-native";
import { OfflineGameView } from "@/components/OfflineGameView";
import { getApiErrorMessage } from "@/utils/error-message";
import { pollAssessmentScoringStatus } from "@/utils/assessment-poll";

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
  const [getAssessmentStatus] = useLazyGetAssessmentStatusQuery();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const readingData = sectionData as ReadingSectionResponse | undefined;
  const questions =
    readingData?.questions ||
    (readingData?.passages && readingData.passages.flatMap((p) => p.questions || [])) ||
    readingData?.sentences ||
    readingData?.items ||
    readingData?.prompts ||
    (readingData as any)?.stories ||
    [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes total
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (sectionData) {
      setIsRunning(true);
    }
  }, [sectionData]);

  useEffect(() => {
    if (!isRunning || isSubmitting || isFinished) return;

    if (timeLeft <= 0) {
      if (isLastQuestion) {
        handleFinish();
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isLastQuestion, isSubmitting, isFinished]);

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 w-full items-center justify-center p-6">
          <View className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-sm items-center justify-center">
            <View
              style={{
                width: 140,
                height: 140,
                marginBottom: 12,
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LottieView
                source={require("../../../assets/mascot/Error 404.lottie")}
                autoPlay
                loop
                style={{ width: "100%", height: "100%" }}
              />
            </View>

            <Text className="text-slate-900 font-extrabold text-xl text-center mb-2">
              Connection Timeout
            </Text>
            <Text className="text-slate-500 text-sm text-center leading-5 mb-4 px-4 text-center">
              Could not load reading section due to network delay. Please try again.
            </Text>

            {/* Inline Arcade Offline Game (Chrome Dino Style) */}
            <OfflineGameView />

            <View className="w-full gap-3 mt-2">
              <TouchableOpacity
                onPress={() => refetch()}
                className="w-full bg-blue-500 active:bg-blue-600 py-4 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || !sectionData) {
    return <GamifiedMascotLoader title="Preparing Reading Assessment..." />;
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>No questions found for this section.</Text>
      </View>
    );
  }

  const currentQId = currentQuestion?.id || currentQuestion?.question_id || "";
  const currentAnswer = answers[currentQId] || "";

  const rawOptions = currentQuestion?.options;
  let normalizedOptions: { label: string; value: string }[] = [];
  if (Array.isArray(rawOptions)) {
    normalizedOptions = rawOptions.map((opt: any, idx: number) => ({
      label: opt.label || String.fromCharCode(65 + idx),
      value: opt.value || opt.option_text || opt.text || "",
    }));
  } else if (rawOptions && typeof rawOptions === "object") {
    normalizedOptions = Object.entries(rawOptions).map(([key, val]) => ({
      label: key.replace("option", ""),
      value: String(val),
    }));
  }
  const isMCQ = normalizedOptions.length > 0;

  const selectAnswer = (value: string) => {
    if (currentQId) {
      setAnswers((prev) => ({ ...prev, [currentQId]: value }));
    }
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

      // Poll/verify status
      await pollAssessmentScoringStatus(sessionId!, getAssessmentStatus);

      // Brief delay to allow dev tunnel proxy socket to clean up before loading next route
      await new Promise((res) => setTimeout(res, 600));

      await saveCompletedSection("A_READING");
      const nextRoute = getNextRouteForSection(response.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err: any) {
      console.error("A_READING submission failed:", err);
      setIsFinished(false);
      const msg = getApiErrorMessage(err, "Could not submit answers.");
      Alert.alert("Submission Failed", msg);
    }
  };

  const handleNext = () => {
    if (!currentAnswer) {
      Alert.alert("Answer Required", "Please select or type an answer before proceeding.");
      return;
    }

    if (isLastQuestion) {
      handleFinish();
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // Find active paragraph for current question from its parent passage, if passages are defined
  const getActiveParagraph = () => {
    if (readingData?.passages && currentQuestion) {
      const qId = currentQuestion.id || currentQuestion.question_id;
      const matchingPassage = readingData.passages.find((p) =>
        p.questions?.some((q) => q.id === qId || q.question_id === qId),
      );
      if (matchingPassage) {
        return matchingPassage.paragraph;
      }
    }
    return (
      readingData?.paragraph ||
      (readingData as any)?.passage_text ||
      (readingData as any)?.text ||
      ""
    );
  };
  const activeParagraph = getActiveParagraph();

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
              stopTimer={isSubmitting || isFinished}
            />

            {!!activeParagraph && (
              <ParagraphDisplay paragraph={activeParagraph} topic="Reading Comprehension" />
            )}

            <ReadingQuestionComponent
              question={
                currentQuestion.question ||
                (currentQuestion as any).question_text ||
                currentQuestion.text ||
                currentQuestion.sentence ||
                currentQuestion.prompt ||
                ""
              }
              questionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
            />

            <View className="mt-4">
              {isMCQ ? (
                normalizedOptions.map((option: any, idx: number) => {
                  return (
                    <MCQOption
                      key={idx}
                      label={option.label}
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
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl items-center shadow-md ${
                  isSubmitting ? "bg-slate-400" : "bg-blue-500 active:bg-blue-600"
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

      {/* Full-screen lock overlay — blocks all interaction during submission */}
      {(isFinished || isSubmitting) && (
        <View className="absolute inset-0 bg-black/55 items-center justify-center z-[9999]">
          <View className="bg-white rounded-2xl py-9 px-10 items-center shadow-lg min-w-[240px]">
            <LottieView
              source={require("../../../assets/mascot/Dino Loading.json")}
              autoPlay
              loop
              style={{ width: 40, height: 40 }}
            />
            <Text className="text-slate-800 font-bold text-base mt-2">Submitting Answers…</Text>
            <Text className="text-slate-500 text-xs mt-1.5 text-center">
              Please wait, do not close the app
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default ReadingScreen;
