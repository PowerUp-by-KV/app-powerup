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
  StyleSheet,
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
  const [isFinished, setIsFinished] = useState(false);

  const grammarData = sectionData as CGrammarSectionResponse | undefined;
  const questions = grammarData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

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
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.title}>Submitting Answers…</Text>
            <Text style={styles.subtitle}>Please wait, do not close the app</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 240,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 18,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },
});

export default GrammarScreen;
