import React from "react";
import { View, ScrollView, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSpeakingState } from "./hooks/useSpeakingState";
import { SpeakingQuestion } from "./components/SpeakingQuestion";
import { RecordingControls } from "./components/RecordingControls";
import type { SpeakingQuestion as ISpeakingQuestion } from "./types";

interface SpeakingScreenProps {
  assessment: {
    questions: ISpeakingQuestion[];
    title: string;
  };
}

export function SpeakingScreen({ assessment }: SpeakingScreenProps) {
  const router = useRouter();
  const {
    currentQuestion,
    currentQuestionIndex,
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
  } = useSpeakingState({ questions: assessment.questions });

  if (!currentQuestion) {
    return <View className="flex-1 items-center justify-center" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4">
        <SpeakingQuestion
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={assessment.questions.length}
        />

        <RecordingControls
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          maxDuration={currentQuestion.recordingTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />

        <View className="flex-row justify-between mt-8 gap-3">
          <TouchableOpacity
            className="flex-1 bg-gray-500 py-3 rounded-lg items-center"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-indigo-600 py-3 rounded-lg items-center"
            onPress={() => router.push("/pre-grammer")}
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
