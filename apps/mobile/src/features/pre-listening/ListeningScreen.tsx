import React from "react";
import { View, ScrollView, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useListeningState } from "./hooks/useListeningState";
import { ListeningQuestion } from "./components/ListeningQuestion";
import { AudioPlayer } from "./components/AudioPlayer";
import { RecordingButton } from "./components/RecordingButton";
import type { ListeningQuestion as IListeningQuestion } from "./types";

interface ListeningScreenProps {
  assessment: {
    questions: IListeningQuestion[];
    title: string;
  };
}

export function ListeningScreen({ assessment }: ListeningScreenProps) {
  const router = useRouter();
  const {
    currentQuestion,
    currentQuestionIndex,
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
  } = useListeningState({ questions: assessment.questions });

  if (!currentQuestion) {
    return <View className="flex-1 items-center justify-center" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4">
        <ListeningQuestion
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={assessment.questions.length}
        />

        <AudioPlayer
          audioText={currentQuestion.audioText}
          duration={currentQuestion.audioDuration}
        />

        <RecordingButton
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
            onPress={() => router.push("/results")}
          >
            <Text className="text-white font-semibold">Finish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
