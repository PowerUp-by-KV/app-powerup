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
import { Platform } from "react-native";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  getNextRouteForSection,
  BSpeakingSectionResponse,
} from "@/services/assessment-api";
import { SpeakingQuestion } from "./components/SpeakingQuestion";
import { RecordingControls } from "./components/RecordingControls";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { getAssessmentSessionId } from "@/services/auth-storage";

interface SpeakingScreenProps {
  sessionId?: string;
}

import { Audio } from "expo-av";
import { uploadAudioFile } from "@/services/audio-upload";

const getOptimizedRecordingSettings = (): any => {
  return {
    android: {
      extension: ".m4a",
      outputFormat: 2, // Audio.AndroidOutputFormat.MPEG_4
      audioEncoder: 3, // Audio.AndroidAudioEncoder.AAC
      sampleRate: 8000,
      numberOfChannels: 1,
      bitRate: 16000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: "aac ", // Audio.IOSOutputFormat.MPEG4AAC
      audioQuality: 0, // Audio.IOSAudioQuality.MIN
      sampleRate: 8000,
      numberOfChannels: 1,
      bitRate: 16000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 16000,
    },
    extension: ".webm",
  };
};

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

  const {
    data: sectionData,
    isLoading,
    isError,
    refetch,
  } = useGetAssessmentSectionQuery(
    { session_id: sessionId!, section: "B_SPEAKING" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const speakingData = sectionData as BSpeakingSectionResponse | undefined;
  const questions = speakingData?.prompts || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [uploadingQuestions, setUploadingQuestions] = useState<Record<string, boolean>>({});
  const isAnyUploading = Object.values(uploadingQuestions).some(Boolean);

  const maxDuration = 30; // Standard for B_SPEAKING

  // Initialize and reset timer for each question
  useEffect(() => {
    if (currentQuestion) {
      // Add a small buffer for preparation
      setTimeLeft(maxDuration + 5);
    }
  }, [currentQuestionIndex, currentQuestion, maxDuration]);

  // Main countdown timer
  useEffect(() => {
    if (!currentQuestion || isSubmitting) return;

    if (timeLeft <= 0) {
      if (isRecording) {
        stopRecording();
      }
      // Auto-advance if not the last question, or submit if last
      if (isLastQuestion) {
        handleFinish();
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isRecording, isLastQuestion, isSubmitting]);

  // Auto-stop recording if maxDuration is reached (double safety)
  useEffect(() => {
    if (isRecording && recordingDuration >= maxDuration) {
      stopRecording();
    }
  }, [recordingDuration, isRecording, maxDuration]);

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
      if (permission.status !== "granted") {
        Alert.alert("Permission", "Microphone access is required.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        getOptimizedRecordingSettings(),
      );
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      Alert.alert("Failed to start recording", (err as Error).message);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri && currentQuestion) {
        const qId = currentQuestion.id;
        setUploadingQuestions((prev) => ({ ...prev, [qId]: true }));

        // Asynchronous, non-blocking upload so user can instantly advance to attend other questions
        uploadAudioFile(uri, "recording.m4a")
          .then((sasUrl) => {
            setAnswers((prev) => ({ ...prev, [qId]: sasUrl }));
          })
          .catch(() => {
            // Background upload failure handler
          })
          .finally(() => {
            setUploadingQuestions((prev) => ({ ...prev, [qId]: false }));
          });
      }
    } catch {
      // Ignore stop errors
    }
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg font-bold text-slate-800 text-center mb-2">
          Connection Timeout
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          Could not load speaking section due to network delay. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-indigo-600 px-6 py-3 rounded-xl shadow-sm"
        >
          <Text className="text-white font-semibold">Retry Loading Questions</Text>
        </TouchableOpacity>
      </View>
    );
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

  const handleFinish = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        audio_url: val,
      }));

      let response: any = null;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await submitSection({
            session_id: sessionId!,
            section: "B_SPEAKING",
            data: { answers: formattedAnswers },
          }).unwrap();
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise((res) => setTimeout(res, 1000));
        }
      }

      await new Promise((res) => setTimeout(res, 600));

      const nextRoute = getNextRouteForSection(response.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not submit answers.";
      Alert.alert("Submission Failed", msg);
    }
  };

  const handleNext = async () => {
    if (isRecording) {
      await stopRecording();
    }

    if (isLastQuestion) {
      handleFinish();
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
    // Disallow going back to previous sections (router.back())
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
          <AssessmentHeader
            sectionName="Section B"
            skillName="Speaking Practice"
            currentQuestion={currentQuestionIndex}
            totalQuestions={questions.length}
            onFinishTest={handleFinish}
            sessionId={sessionId}
          />

          <SpeakingQuestion
            question={currentQuestion as any}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            timeLeft={timeLeft}
          />

          <RecordingControls
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            maxDuration={maxDuration}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />

          {uploadingQuestions[currentQuestion?.id] && (
            <View className="flex-row items-center justify-center bg-amber-50 py-2 px-4 rounded-xl mt-3 border border-amber-200">
              <ActivityIndicator size="small" color="#d97706" className="mr-2" />
              <Text className="text-xs text-amber-700 font-medium">
                Uploading audio in background...
              </Text>
            </View>
          )}

          <View className="flex-row justify-between mt-8 gap-4 mb-4">
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                className="flex-1 bg-slate-200 py-4 rounded-2xl items-center shadow-sm"
                onPress={handleBack}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <Text className="text-slate-700 font-bold text-base">Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className={`flex-1 py-4 rounded-2xl items-center justify-center shadow-md ${
                isSubmitting || (isLastQuestion && isAnyUploading) ? "bg-slate-400" : "bg-slate-800"
              }`}
              onPress={handleNext}
              disabled={isSubmitting || (isLastQuestion && isAnyUploading)}
              activeOpacity={0.8}
            >
              {isSubmitting || (isLastQuestion && isAnyUploading) ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold text-base">
                    {isAnyUploading ? "Uploading Audio..." : "Submitting..."}
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-base">
                  {isLastQuestion ? "Check Answers" : "Next Question"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
