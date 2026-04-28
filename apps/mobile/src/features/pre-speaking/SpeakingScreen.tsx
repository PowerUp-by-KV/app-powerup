import React, { useState, useEffect } from "react";
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
import { SpeakingQuestion } from "./components/SpeakingQuestion";
import { RecordingControls } from "./components/RecordingControls";

interface SpeakingScreenProps {
  sessionId?: string;
}

export function SpeakingScreen({ sessionId }: SpeakingScreenProps) {
  const router = useRouter();

  const { data: sectionData, isLoading } = useGetAssessmentSectionQuery(
    { session_id: sessionId!, section: "B_SPEAKING" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Dummy recording state since useSpeakingState is not adapted to API yet
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => {
    setIsRecording(false);
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: "recorded_audio.m4a" }));
    }
  };

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

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleFinish = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        audio_url: val,
      }));

      const response = await submitSection({
        session_id: sessionId!,
        section: "B_SPEAKING",
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
        <SpeakingQuestion
          question={currentQuestion as any}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />

        <RecordingControls
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          maxDuration={30}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />

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
