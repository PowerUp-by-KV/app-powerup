/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  getNextRouteForSection,
  DListenAnswerSectionResponse,
  useLazyGetAssessmentStatusQuery,
} from "@/services/assessment-api";
import { ListeningQuestion } from "./components/ListeningQuestion";
import { AudioPlayer } from "./components/AudioPlayer";
import { MCQOption } from "./components/ReadingMCQOption";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import LottieView from "lottie-react-native";
import { OfflineGameView } from "@/components/OfflineGameView";
import { getApiErrorMessage } from "@/utils/error-message";
import { pollAssessmentScoringStatus } from "@/utils/assessment-poll";
import { showAlert } from "@/utils/alert";

interface ListeningScreenProps {
  sessionId?: string;
}

export function ListeningScreen({ sessionId: propSessionId }: ListeningScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sessionId, setSessionId] = useState<string | undefined>(propSessionId);
  const scrollViewRef = useRef<ScrollView>(null);

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
  const [getAssessmentStatus] = useLazyGetAssessmentStatusQuery();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [hasAudioFinished, setHasAudioFinished] = useState(false);

  const listenData = sectionData as DListenAnswerSectionResponse | undefined;
  const questions = listenData?.stories || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const maxDuration = (currentQuestion as any)?.recording_time_seconds || 60;

  // Reset state on question change
  useEffect(() => {
    if (currentQuestion) {
      setHasAudioFinished(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentQuestionIndex, currentQuestion, maxDuration]);

  // Timer logic removed

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (isError) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="flex-1 bg-slate-50 dark:bg-[#151620]"
      >
        <View className="flex-1 w-full items-center justify-center p-6">
          <View className="w-full max-w-sm bg-white dark:bg-[#1E1F2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm items-center justify-center">
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

            <Text className="text-slate-900 dark:text-white font-extrabold text-xl text-center mb-2">
              Connection Timeout
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center leading-5 mb-4 px-4 text-center">
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
      </View>
    );
  }

  if (isLoading || !sectionData) {
    return <GamifiedMascotLoader title="Preparing Listening Comprehension..." />;
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#151620]">
        <Text className="dark:text-white">No questions found for this section.</Text>
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

      // Poll/verify status
      await pollAssessmentScoringStatus(sessionId!, getAssessmentStatus);

      await saveCompletedSection("D_LISTEN_ANSWER");
      await new Promise((res) => setTimeout(res, 600));

      const nextRoute = getNextRouteForSection(response?.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err: any) {
      console.error("D_LISTEN_ANSWER submission failed:", err);
      setIsFinished(false);
      const msg = getApiErrorMessage(err, "Could not submit answers.");
      showAlert("Submission Failed", msg);
    }
  };
  const handleNext = async () => {
    const currentStoryQuestions = currentQuestion?.questions || [];
    const allAnswered = currentStoryQuestions.every((q: any) => !!answers[q.id]);

    if (currentStoryQuestions.length > 0 && !allAnswered) {
      showAlert(
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
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-white dark:bg-[#151620]"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
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
          />

          <AudioPlayer
            audioUrl={(currentQuestion as any)?.audio_url}
            audioText={(currentQuestion as any)?.script || "Please listen to the audio carefully."}
            duration={30}
            onPlayEnd={() => setHasAudioFinished(true)}
          />

          <View className="mt-4 mb-4">
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Answer the questions below:
            </Text>
            {currentQuestion?.questions?.map((q: any, qIdx: number) => {
              const currentAnswer = answers[q.id] || "";
              return (
                <View
                  key={q.id}
                  className="mb-6 bg-slate-50 dark:bg-[#1E1F2A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <Text className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 leading-relaxed">
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
                        disabled={!hasAudioFinished}
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
        <View className="absolute inset-0 bg-black/60 items-center justify-center z-[9999]">
          <View className="bg-white dark:bg-[#1E1F2A] rounded-2xl py-9 px-10 items-center shadow-lg min-w-[240px] border border-slate-100 dark:border-slate-800">
            <LottieView
              source={require("../../../assets/mascot/Dino Loading.json")}
              autoPlay
              loop
              style={{ width: 140, height: 140 }}
            />
            <Text className="text-slate-800 dark:text-white font-bold text-lg mt-4 text-center">
              Submitting Answers…
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center px-4">
              Please wait, do not close the app
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default ListeningScreen;
