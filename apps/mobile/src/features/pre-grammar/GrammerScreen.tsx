import React from "react";
import { View, ScrollView, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useGrammarState } from "./hooks/useGrammarState";
import { GrammarQuestion as GrammarQuestionComponent } from "./components/GrammarQuestion";
import { MCQOption } from "./components/MCQOption";
import { FillBlankInput } from "./components/FillBlankInput";
import type { GrammarQuestion as IGrammarQuestion } from "./types";

interface GrammerScreenProps {
  assessment: {
    questions: IGrammarQuestion[];
    title: string;
  };
}

export function GrammerScreen({ assessment }: GrammerScreenProps) {
  const router = useRouter();
  const { currentQuestion, currentQuestionIndex, answers, selectAnswer } = useGrammarState({
    questions: assessment.questions,
  });

  if (!currentQuestion) {
    return <View className="flex-1 items-center justify-center" />;
  }

  const currentAnswer = answers[currentQuestionIndex] || "";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4">
        <GrammarQuestionComponent
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={assessment.questions.length}
        />

        {currentQuestion.questionType === "MCQ" && currentQuestion.options && (
          <View className="mt-4">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
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
        )}

        {currentQuestion.questionType === "Fill in the Blanks" && (
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
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-indigo-600 py-3 rounded-lg items-center"
            onPress={() => router.push("/listen")}
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
