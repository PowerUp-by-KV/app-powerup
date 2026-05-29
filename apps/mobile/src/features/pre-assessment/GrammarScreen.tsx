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
  CGrammarSectionResponse,
} from "@/services/assessment-api";
import { GrammarQuestion as GrammarQuestionComponent } from "./components/GrammarQuestion";
import { MCQOption } from "./components/GrammarMCQOption";
import { FillBlankInput } from "./components/FillBlankInput";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import LottieView from "lottie-react-native";
import { OfflineGameView } from "@/components/OfflineGameView";

interface GrammarScreenProps {
  sessionId?: string;
}

export function GrammarScreen({ sessionId: propSessionId }: GrammarScreenProps) {
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
    { session_id: sessionId!, section: "C_GRAMMAR" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const grammarData = sectionData as CGrammarSectionResponse | undefined;
  const questions = grammarData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

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
              Could not load grammar section due to network delay. Please try again.
            </Text>

            {/* Inline Arcade Offline Game (Chrome Dino Style) */}
            <OfflineGameView />

            <View className="w-full gap-3 mt-2">
              <TouchableOpacity
                onPress={() => refetch()}
                className="w-full bg-slate-900 active:bg-slate-800 py-4 rounded-xl items-center justify-center shadow-sm"
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
    return <GamifiedMascotLoader title="Preparing Grammar Check..." />;
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>No questions found for this section.</Text>
      </View>
    );
  }

  const currentAnswer = answers[currentQuestion.id] || "";
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isMCQ = currentQuestion.options && currentQuestion.options.length > 0;

  const selectAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleFinish = async () => {
    setIsFinished(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        answer: val,
      }));

      const response = await submitSection({
        session_id: sessionId!,
        section: "C_GRAMMAR",
        data: { answers: formattedAnswers },
      }).unwrap();

      await saveCompletedSection("C_GRAMMAR");
      const nextRoute = getNextRouteForSection(response.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch {
      Alert.alert("Error", "Could not submit answers.");
    }
  };
  const handleNext = () => {
    if (!currentAnswer) {
      Alert.alert("Answer Required", "Please provide an answer before proceeding.");
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
            sectionName="Section C"
            skillName="Grammar & Language Usage"
            currentQuestion={currentQuestionIndex}
            totalQuestions={questions.length}
            onFinishTest={handleFinish}
            sessionId={sessionId}
            stopTimer={isSubmitting || isFinished}
          />

          <GrammarQuestionComponent
            question={currentQuestion as any}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
          />

          {isMCQ && currentQuestion.options ? (
            <View className="mt-4">
              {currentQuestion.options.map((option: any, idx: number) => {
                return (
                  <MCQOption
                    key={idx}
                    label={option.label || String.fromCharCode(65 + idx)}
                    text={option.value}
                    isSelected={currentAnswer === option.value}
                    onSelect={() => selectAnswer(option.value)}
                  />
                );
              })}
            </View>
          ) : (
            <View className="mt-4">
              <FillBlankInput
                value={currentAnswer}
                placeholder="Fill in the blank..."
                onChange={(text: string) => selectAnswer(text)}
              />
            </View>
          )}

          <View className="flex-row justify-between mt-8 gap-4 mb-4">
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

export default GrammarScreen;
