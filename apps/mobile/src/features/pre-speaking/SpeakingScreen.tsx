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
} from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  useUploadAssessmentAudioMutation,
  getNextRouteForSection,
  type AssessmentQuestion,
} from "@/services/assessment-api";
import { SpeakingQuestion } from "./components/SpeakingQuestion";
import { RecordingControls } from "./components/RecordingControls";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { AssessmentHeader } from "@/features/pre-assessment";

interface SpeakingScreenProps {
  sessionId?: string;
}

export function SpeakingScreen({ sessionId: propSessionId }: SpeakingScreenProps) {
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
    { session_id: sessionId!, section: "B_SPEAKING" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();
  const [uploadAudio] = useUploadAssessmentAudioMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [startedAt] = useState(() => Date.now());

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

  async function stopRecording(questionId?: string): Promise<boolean> {
    if (!recording) return true;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    const targetId = questionId ?? currentQuestion?.id;
    if (!uri || !targetId) return true;

    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as unknown as Blob);

      const result = await uploadAudio(formData).unwrap();
      setAnswers((prev) => ({ ...prev, [targetId]: result.audio_url }));
      return true;
    } catch (err) {
      console.error("Audio upload failed", err);
      Alert.alert("Upload Failed", "Failed to upload your recording. Please try again.");
      return false;
    } finally {
      setIsUploadingAudio(false);
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
    if (isRecording) {
      const success = await stopRecording();
      if (!success) return;
    }
    try {
      const formattedAnswers = questions.map((q: AssessmentQuestion) => ({
        question_id: q.id,
        answer: "",
        audio_url: answers[q.id] ?? undefined,
      }));

      const response = await submitSection({
        session_id: sessionId!,
        section: "B_SPEAKING",
        data: { answers: formattedAnswers },
      }).unwrap();

      await saveCompletedSection("B_SPEAKING");
      const nextRoute = getNextRouteForSection(response.next_section);
      router.push({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err) {
      Alert.alert("Error", "Could not submit answers.");
    }
  };

  const handleNext = async () => {
    if (isRecording) {
      const success = await stopRecording(currentQuestion?.id);
      if (!success) return;
    }
    if (isLastQuestion) {
      await handleFinish();
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
    setRecordingDuration(0);
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
      <AssessmentHeader
        section="B_SPEAKING"
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        startedAtMs={startedAt}
        onFinish={handleFinish}
        onSectionChange={(next) =>
          router.replace({
            pathname: getNextRouteForSection(next),
            params: { session_id: sessionId },
          })
        }
      />
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
              className={`flex-1 py-3 rounded-lg items-center ${isSubmitting || isUploadingAudio ? "bg-indigo-400" : "bg-indigo-600"}`}
              onPress={handleNext}
              disabled={isSubmitting || isUploadingAudio}
            >
              {isSubmitting || isUploadingAudio ? (
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
