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
import { Audio } from "expo-av";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  useUploadAssessmentAudioMutation,
  getNextRouteForSection,
  type AssessmentQuestion,
} from "@/services/assessment-api";
import { SentenceDisplay } from "./components/SentenceDisplay";
import { Recorder } from "./components/Recorder";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { AssessmentHeader } from "@/features/pre-assessment";

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
  const [uploadAudio] = useUploadAssessmentAudioMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const questions = (sectionData?.sentences ?? []) as AssessmentQuestion[];
  const currentQuestion = questions[currentQuestionIndex];

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
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

  async function stopRecording(questionId?: string): Promise<string | null> {
    const targetId = questionId ?? currentQuestion?.id;
    if (!recording) return targetId ? (answers[String(targetId)] ?? null) : null;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (!uri || !targetId) return null;

    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", { uri, name: "recording.m4a", type: "audio/m4a" } as unknown as Blob);
      const result = await uploadAudio(formData).unwrap();
      setAnswers((prev) => ({ ...prev, [String(targetId)]: result.audio_url }));
      return result.audio_url;
    } catch (err) {
      console.error("Audio upload failed", err);
      Alert.alert("Upload Failed", "Failed to upload your recording. Please try again.");
      return null;
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
    let nextAnswers = answers;
    if (isRecording) {
      const uploadedUrl = await stopRecording(String(currentQuestion?.id));
      if (!uploadedUrl) return;
      nextAnswers = { ...answers, [String(currentQuestion?.id)]: uploadedUrl };
    }
    const missingAnswer = questions.some((q) => !nextAnswers[String(q.id)]);
    if (missingAnswer) {
      Alert.alert("Recording required", "Please record every sentence before submitting.");
      return;
    }
    try {
      const formattedAnswers = questions.map((q) => ({
        question_id: q.id,
        answer: "",
        audio_url: nextAnswers[String(q.id)] ?? undefined,
      }));

      const response = await submitSection({
        session_id: sessionId!,
        section: "A_SPEAKING",
        data: { answers: formattedAnswers },
      }).unwrap();

      await saveCompletedSection("A_SPEAKING");
      const nextRoute = getNextRouteForSection(response.next_section);
      router.push({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err) {
      console.error("Speak-by-reading assessment submit failed", err);
      Alert.alert("Error", "Could not submit answers.");
    }
  };

  const handleNext = async () => {
    let uploadedUrl: string | null = null;
    if (isRecording) {
      uploadedUrl = await stopRecording(String(currentQuestion?.id));
      if (!uploadedUrl) return;
    }
    if (!uploadedUrl && !answers[String(currentQuestion.id)]) {
      Alert.alert("Recording required", "Please record your response before moving on.");
      return;
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

  const maxDuration = currentQuestion.recording_time_seconds ?? 15;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <AssessmentHeader
        section="A_SPEAKING"
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
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <SentenceDisplay
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />

        <Recorder
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          maxDuration={maxDuration}
          onStartRecording={startRecording}
          onStopRecording={() => {
            void stopRecording(String(currentQuestion.id));
          }}
        />

        {answers[String(currentQuestion.id)] && (
          <Text className="text-xs text-green-600 text-center mt-1">Recording saved ✓</Text>
        )}

        <View className="flex-row justify-between mt-6 gap-3">
          <TouchableOpacity
            className="flex-1 bg-gray-500 py-3 rounded-lg items-center"
            onPress={handleBack}
            disabled={isSubmitting || isUploadingAudio}
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
              <Text className="text-white font-semibold">{isLastQuestion ? "Submit" : "Next"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
