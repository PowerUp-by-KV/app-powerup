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
  ReadingSectionResponse,
} from "@/services/assessment-api";
import { ReadingQuestion as ReadingQuestionComponent } from "./components/ReadingQuestion";
import { ParagraphDisplay } from "./components/ParagraphDisplay";
import { MCQOption } from "./components/ReadingMCQOption";
import { FillBlankInput } from "./components/FillBlankInput";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";

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
  const questions =
    readingData?.questions ||
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

      // Brief delay to allow dev tunnel proxy socket to clean up before loading next route
      await new Promise((res) => setTimeout(res, 600));

      await saveCompletedSection("A_READING");
      const nextRoute = getNextRouteForSection(response.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch {
      Alert.alert("Error", "Could not submit answers. Please try again.");
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

            {(readingData?.paragraph ||
              (readingData as any)?.passage_text ||
              (readingData as any)?.text) && (
              <ParagraphDisplay
                paragraph={
                  readingData?.paragraph ||
                  (readingData as any)?.passage_text ||
                  (readingData as any)?.text ||
                  ""
                }
                topic="Reading Comprehension"
              />
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
              timeLeft={questionTimeLeft}
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

export default ReadingScreen;
