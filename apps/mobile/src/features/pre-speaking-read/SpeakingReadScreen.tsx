import React from "react";
import { View, ScrollView, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSpeakingReadState } from "./hooks/useSpeakingReadState";
import { SentenceDisplay } from "./components/SentenceDisplay";
import { Recorder } from "./components/Recorder";
import type { SpeakingReadQuestion as ISpeakingReadQuestion } from "./types";

interface SpeakingReadScreenProps {
  assessment: {
    questions: ISpeakingReadQuestion[];
    title: string;
  };
}

export function SpeakingReadScreen({ assessment }: SpeakingReadScreenProps) {
  const router = useRouter();
  const {
    currentQuestion,
    currentQuestionIndex,
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
  } = useSpeakingReadState({ questions: assessment.questions });

  if (!currentQuestion) {
    return <View className="flex-1 items-center justify-center" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4">
        <SentenceDisplay
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={assessment.questions.length}
        />

        <Recorder
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
            onPress={() => router.push("/listen-audio")}
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
