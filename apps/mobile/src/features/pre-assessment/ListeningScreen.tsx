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
  DListenAnswerSectionResponse,
} from "@/services/assessment-api";
import { ListeningQuestion } from "./components/ListeningQuestion";
import { AudioPlayer } from "./components/AudioPlayer";
import { MCQOption } from "./components/ReadingMCQOption";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import LottieView from "lottie-react-native";
import { OfflineGameView } from "@/components/OfflineGameView";

interface ListeningScreenProps {
  sessionId?: string;
}

export function ListeningScreen({ sessionId: propSessionId }: ListeningScreenProps) {
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
    { session_id: sessionId!, section: "D_LISTEN_ANSWER" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const listenData = sectionData as DListenAnswerSectionResponse | undefined;
  const questions = listenData?.stories || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const [timeLeft, setTimeLeft] = useState(60); // Default 60s for story comprehension

  const maxDuration = (currentQuestion as any)?.recording_time_seconds || 60;

  // Reset timer on question change
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(maxDuration + 15);
    }
  }, [currentQuestionIndex, currentQuestion, maxDuration]);

  // Main countdown timer
  useEffect(() => {
    if (!currentQuestion || isSubmitting || isFinished) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isLastQuestion, isSubmitting, isFinished]);

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 w-full items-center justify-center p-6">
          <View className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-sm items-center justify-center">
            <LottieView
              source={require("../../../assets/mascot/Error 404.lottie")}
              autoPlay
              loop
              style={{ width: 140, height: 140, marginBottom: 12 }}
            />

            <Text className="text-slate-900 font-extrabold text-xl text-center mb-2">
              Connection Timeout
            </Text>
            <Text className="text-slate-500 text-sm text-center leading-5 mb-4 px-4 text-center">
              Could not load listening section due to network delay. Please try again.
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
    return <GamifiedMascotLoader title="Preparing Listening Comprehension..." />;
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>No questions found for this section.</Text>
      </View>
    );
  }

  const handleFinish = async () => {
    setIsFinished(true);
    try {
      const allStoryQuestions = questions.flatMap((story) => story.questions || []);
      const formattedAnswers = allStoryQuestions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] || "",
      }));

      let response: any = null;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await submitSection({
            session_id: sessionId!,
            section: "D_LISTEN_ANSWER",
            data: { answers: formattedAnswers },
          }).unwrap();
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise((res) => setTimeout(res, 1000));
        }
      }

      await saveCompletedSection("D_LISTEN_ANSWER");
      await new Promise((res) => setTimeout(res, 600));

      const nextRoute = getNextRouteForSection(response?.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not submit answers.";
      Alert.alert("Submission Failed", msg);
    }
  };
  const handleNext = async () => {
    const currentStoryQuestions = currentQuestion?.questions || [];
    const allAnswered = currentStoryQuestions.every((q: any) => !!answers[q.id]);

    if (currentStoryQuestions.length > 0 && !allAnswered) {
      Alert.alert(
        "Answers Required",
        "Please answer all questions for this story before proceeding.",
      );
      return;
    }

    if (isLastQuestion) {
      handleFinish();
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AssessmentHeader
            sectionName="Section D"
            skillName="Listening Comprehension"
            currentQuestion={currentQuestionIndex}
            totalQuestions={questions.length}
            onFinishTest={handleFinish}
            sessionId={sessionId}
            stopTimer={isSubmitting || isFinished}
          />

          <ListeningQuestion
            question={currentQuestion as any}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            timeLeft={timeLeft}
          />

          <AudioPlayer
            audioUrl={(currentQuestion as any)?.audio_url}
            audioText={(currentQuestion as any)?.script || "Please listen to the audio carefully."}
            duration={30}
          />

          <View className="mt-4 mb-4">
            <Text className="text-base font-bold text-slate-900 mb-4">
              Answer the questions below:
            </Text>
            {currentQuestion?.questions?.map((q: any, qIdx: number) => {
              const currentAnswer = answers[q.id] || "";
              return (
                <View
                  key={q.id}
                  className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <Text className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">
                    {qIdx + 1}. {q.question}
                  </Text>
                  <View className="mt-2">
                    {q.options?.map((opt: any, optIdx: number) => (
                      <MCQOption
                        key={optIdx}
                        label={opt.label || String.fromCharCode(65 + optIdx)}
                        text={opt.value}
                        isSelected={currentAnswer === opt.value}
                        onSelect={() => selectAnswer(q.id, opt.value)}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <View className="flex-row justify-between mt-4 gap-4 mb-4">
            <TouchableOpacity
              className={`flex-1 py-4 rounded-2xl items-center justify-center shadow-md ${
                isSubmitting ? "bg-slate-400" : "bg-blue-500 active:bg-blue-600"
              }`}
              onPress={handleNext}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold text-base">Submitting...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-base">
                  {isLastQuestion ? "Finish Assessment" : "Next Story"}
                </Text>
              )}
            </TouchableOpacity>
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

export default ListeningScreen;
