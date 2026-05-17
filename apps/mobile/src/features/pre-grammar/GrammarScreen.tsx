import React, { useState } from "react";
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
} from "@/services/assessment-api";
import { GrammarQuestion as GrammarQuestionComponent } from "./components/GrammarQuestion";
import { MCQOption } from "./components/MCQOption";
import { FillBlankInput } from "./components/FillBlankInput";
import { useEffect } from "react";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { AssessmentHeader } from "@/features/pre-assessment";

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

  const { data: sectionData, isLoading } = useGetAssessmentSectionQuery(
    { session_id: sessionId!, section: "C_GRAMMAR" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());

  const questions =
    sectionData?.questions ||
    sectionData?.sentences ||
    sectionData?.items ||
    sectionData?.prompts ||
    sectionData?.stories ||
    [];
  const currentQuestion = questions[currentQuestionIndex];

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
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isMCQ = currentQuestion.options && currentQuestion.options.length > 0;

  const selectAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleFinish = async () => {
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
      router.push({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err) {
      Alert.alert("Error", "Could not submit answers.");
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
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <AssessmentHeader
        section="C_GRAMMAR"
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        startedAtMs={startedAt}
        onFinish={handleFinish}
        onSectionChange={(next) =>
          router.replace({
            pathname: getNextRouteForSection(next),
            params: { session_id: sessionId },
          })
        }
      />
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

          <View className="flex-row justify-between mt-8 gap-3">
            <TouchableOpacity
              className="flex-1 bg-gray-500 py-3 rounded-lg items-center"
              onPress={handleBack}
              disabled={isSubmitting}
            >
              <Text className="text-white font-semibold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg items-center ${isSubmitting ? "bg-indigo-400" : "bg-indigo-600"}`}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  {isLastQuestion ? "Submit" : "Next"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default GrammarScreen;
