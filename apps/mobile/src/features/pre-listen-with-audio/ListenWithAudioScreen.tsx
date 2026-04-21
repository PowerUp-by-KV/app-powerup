import React from "react";
import { View, ScrollView, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useListenWithAudioState } from "./hooks/useListenWithAudioState";
import { ListenWithAudioQuestion } from "./components/ListenWithAudioQuestion";
import { AudioPlayer } from "./components/AudioPlayer";
import { RecordingButton } from "./components/RecordingButton";
import type { ListenWithAudioQuestion as IListenWithAudioQuestion } from "./types";

interface PreListenWithAudioScreenProps {
  assessment: {
    questions: IListenWithAudioQuestion[];
    title: string;
  };
}

export function PreListenWithAudioScreen({ assessment }: PreListenWithAudioScreenProps) {
  const router = useRouter();
  const {
    currentQuestion,
    currentQuestionIndex,
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
  } = useListenWithAudioState({ questions: assessment.questions });

  if (!currentQuestion) {
    return <View className="flex-1 items-center justify-center" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4">
        <ListenWithAudioQuestion
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
            onPress={() => router.push("/speak")}
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
