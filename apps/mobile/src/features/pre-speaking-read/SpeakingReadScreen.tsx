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
} from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  getNextRouteForSection,
} from "@/services/assessment-api";
import { SentenceDisplay } from "./components/SentenceDisplay";
import { Recorder } from "./components/Recorder";
import { getAssessmentSessionId } from "@/services/auth-storage";

interface SpeakingReadScreenProps {
  sessionId?: string;
}

export function SpeakingReadScreen({ sessionId: propSessionId }: SpeakingReadScreenProps) {
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
    { session_id: sessionId!, section: "A_SPEAKING" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions =
    sectionData?.questions ||
    sectionData?.sentences ||
    sectionData?.items ||
    sectionData?.prompts ||
    sectionData?.stories ||
    [];
  const currentQuestion = questions[currentQuestionIndex];

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri && currentQuestion) {
      try {
        let base64String = "";
        if (Platform.OS === "web") {
          const response = await fetch(uri);
          const blob = await response.blob();
          base64String = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } else {
          base64String = await FileSystem.readAsStringAsync(uri, {
            encoding: "base64",
          });
          base64String = `data:audio/m4a;base64,${base64String}`;
        }

        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: base64String }));
      } catch (err) {
        console.error("Failed to convert audio to base64", err);
      }
    }
  }

  if (isLoading || !sectionData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

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
        answer: val, // Sending base64 string in both for safety
        audio_url: val,
      }));

      const response = await submitSection({
        session_id: sessionId!,
        section: "A_SPEAKING",
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
          <SentenceDisplay
            question={currentQuestion as any}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
          />

          <Recorder
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            maxDuration={
              currentQuestion.recordingTime ||
              (currentQuestion.complexity === "Advanced" ||
              currentQuestion.complexity === "Difficult"
                ? 30
                : 15)
            }
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
                <Text className="text-white font-semibold">
                  {isLastQuestion ? "Submit" : "Next"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
