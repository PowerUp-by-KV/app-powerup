import React, { useState, useEffect } from "react";
import { View, ScrollView, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useReadingState } from "./hooks/useReadingState";
import { ReadingQuestion as ReadingQuestionComponent } from "./components/ReadingQuestion";
import { ParagraphDisplay } from "./components/ParagraphDisplay";
import { MCQOption } from "./components/MCQOption";
import type { ReadingAssessment } from "./types";

interface ReadingScreenProps {
  assessment: ReadingAssessment;
}

export function ReadingScreen({ assessment }: ReadingScreenProps) {
  const router = useRouter();
  const {
    currentQuestion,
    currentQuestionIndex,
    answers,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
  } = useReadingState({ questions: assessment.questions });

  const [timeLeft, setTimeLeft] = useState(assessment.timeLimit ?? 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);
      if (currentQuestionIndex < assessment.questions.length - 1) {
        goToNextQuestion();
        setTimeLeft(assessment.timeLimit ?? 60);
        setIsRunning(true);
      } else {
        router.push("/speak-read");
      }
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [
    isRunning,
    timeLeft,
    currentQuestionIndex,
    assessment.questions.length,
    assessment.timeLimit,
    goToNextQuestion,
    router,
  ]);

  useEffect(() => {
    setTimeLeft(assessment.timeLimit ?? 60);
    setIsRunning(true);
  }, [currentQuestionIndex, assessment.timeLimit]);

  if (!currentQuestion) {
    return <View className="flex-1 items-center justify-center" />;
  }

  const currentAnswer = answers[currentQuestionIndex] || "";
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  const progressText = `Question ${currentQuestionIndex + 1} of ${assessment.questions.length}`;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const handleNext = () => {
    if (isLastQuestion) {
      router.push("/speak-read");
      return;
    }
    goToNextQuestion();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4 py-4">
          <View className="rounded-3xl bg-slate-100 p-4 mb-4">
            <Text className="text-sm text-slate-500">{progressText}</Text>
            <Text className="text-sm text-right text-indigo-600 font-semibold">
              Time left: {timerLabel}
            </Text>
          </View>

          <ParagraphDisplay paragraph={currentQuestion.paragraph} topic={currentQuestion.topic} />

          <ReadingQuestionComponent
            question={currentQuestion.question}
            questionIndex={currentQuestionIndex}
            totalQuestions={assessment.questions.length}
          />

          <View className="mt-4">
            {currentQuestion.options &&
              Object.entries(currentQuestion.options).map(([key, value]) => {
                const label = key.replace("option", "");
                return (
                  <MCQOption
                    key={key}
                    label={label}
                    text={value}
                    isSelected={currentAnswer === value}
                    onSelect={() => selectAnswer(value)}
                  />
                );
              })}
          </View>

          <View className="flex-row justify-between mt-8 gap-3 mb-8">
            <TouchableOpacity
              className="flex-1 bg-gray-500 py-3 rounded-lg items-center"
              onPress={() => {
                if (currentQuestionIndex > 0) {
                  goToPreviousQuestion();
                } else {
                  router.back();
                }
              }}
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-indigo-600 py-3 rounded-lg items-center"
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold">{isLastQuestion ? "Submit" : "Next"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
