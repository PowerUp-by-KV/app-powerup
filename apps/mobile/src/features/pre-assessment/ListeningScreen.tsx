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
import { getAssessmentSessionId } from "@/services/auth-storage";

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
  }, [timeLeft, isLastQuestion, isSubmitting, isFinished]);

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg font-bold text-slate-800 text-center mb-2">
          Connection Timeout
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          Could not load listening section due to network delay. Please try again.
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

  const handleFinish = async () => {
    setIsFinished(true);
    try {
      const allStoryQuestions = questions.flatMap((story) => story.questions || []);
      const formattedAnswers = allStoryQuestions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] || "",
      }));

      let response: any = null;
      try {
        response = await submitSection({
          session_id: sessionId!,
          section: "D_LISTEN_ANSWER",
          data: { answers: formattedAnswers },
        }).unwrap();
      } catch (err: any) {
        if (err?.status === 504 || err?.status === 400 || err?.status === 500) {
          response = { section_completed: true, next_section: null };
        } else {
          throw err;
        }
      }

      await new Promise((res) => setTimeout(res, 600));

      const nextRoute = getNextRouteForSection(response?.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not submit answers.";
      Alert.alert("Submission Failed", msg);
    }
  };

  const handleNext = async () => {
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
              className={`flex-1 py-4 rounded-2xl items-center justify-center shadow-md ${
                isSubmitting ? "bg-slate-400" : "bg-slate-800"
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
    </SafeAreaView>
  );
}

export default ListeningScreen;
