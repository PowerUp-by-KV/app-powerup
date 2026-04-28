import React, { useState } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
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

interface GrammarScreenProps {
  sessionId?: string;
}

export function GrammarScreen({ sessionId }: GrammarScreenProps) {
  const router = useRouter();

  const { data: sectionData, isLoading } = useGetAssessmentSectionQuery(
    { session_id: sessionId!, section: "C_GRAMMAR" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (isLoading || !sectionData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const questions = sectionData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4">
        <GrammarQuestionComponent
          question={currentQuestion as any}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />

        {isMCQ ? (
          <View className="mt-4">
            {currentQuestion.options.map((option, idx) => {
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
              <Text className="text-white font-semibold">{isLastQuestion ? "Submit" : "Next"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default GrammarScreen;
