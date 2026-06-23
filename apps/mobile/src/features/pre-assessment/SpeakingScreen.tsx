/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  getNextRouteForSection,
  BSpeakingSectionResponse,
  useLazyGetAssessmentStatusQuery,
} from "@/services/assessment-api";
import { SpeakingQuestion } from "./components/SpeakingQuestion";
import { RecordingControls } from "./components/RecordingControls";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { SpeakingFeedbackPlayback } from "@/components/assessment/SpeakingFeedbackPlayback";
import { OfflineGameView } from "@/components/OfflineGameView";
import LottieView from "lottie-react-native";

import { Audio } from "expo-av";
import { uploadAudioFile } from "@/services/audio-upload";
import { getApiErrorMessage } from "@/utils/error-message";
import { pollAssessmentScoringStatus } from "@/utils/assessment-poll";

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
  const insets = useSafeAreaInsets();
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
  const [getAssessmentStatus] = useLazyGetAssessmentStatusQuery();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasRecorded, setHasRecorded] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  const speakingData = sectionData as BSpeakingSectionResponse | undefined;
  const questions = speakingData?.prompts || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const [isRecording, setIsRecording] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [uploadingQuestions, setUploadingQuestions] = useState<Record<string, boolean>>({});
  const isAnyUploading = Object.values(uploadingQuestions).some(Boolean);

  const [currentLocalUri, setCurrentLocalUri] = useState<string | null>(null);
  const [currentLocalDuration, setCurrentLocalDuration] = useState<number>(0);

  const comp = String(currentQuestion?.complexity || "")
    .toLowerCase()
    .trim();
  const maxDuration =
    currentQuestion?.time_seconds || (comp === "easy" || comp === "medium" ? 15 : 30);

  // Initialize and reset timer for each question
  useEffect(() => {
    if (currentQuestion) {
      // Add a small buffer for preparation
      setTimeLeft(maxDuration + 5);
      setRecordingDuration(0);
      setIsRecording(false);
      setRecording(null);
      setHasStartedRecording(false);
      setCurrentLocalUri(null);
      setCurrentLocalDuration(0);
    }
  }, [currentQuestionIndex, currentQuestion, maxDuration]);

  // Main countdown timer
  useEffect(() => {
    if (!currentQuestion || isSubmitting || isFinished || !hasStartedRecording || !isRecording)
      return;

    if (timeLeft <= 0) {
      const processTimerExpiry = async () => {
        if (isRecording) {
          await stopRecording();
        }
      };
      processTimerExpiry();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isRecording, isSubmitting, isFinished, hasStartedRecording]);

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
      if (!hasStartedRecording) {
        setHasStartedRecording(true);
        setTimeLeft(maxDuration + 5);
      }
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
        setCurrentLocalUri(uri);
        setCurrentLocalDuration(recordingDuration);
        setHasRecorded((prev) => ({ ...prev, [qId]: true }));
        setUploadingQuestions((prev) => ({ ...prev, [qId]: true }));

        // Asynchronous upload that returns a promise so callers can await it before submitting
        return uploadAudioFile(uri, "recording.m4a")
          .then((sasUrl) => {
            setAnswers((prev) => ({ ...prev, [qId]: sasUrl }));
            return sasUrl;
          })
          .catch((_err) => {
            Alert.alert(
              "Upload Failed",
              "We had trouble uploading your audio. Please tap 'Retake' and try recording again.",
            );
            setHasRecorded((prev) => ({ ...prev, [qId]: false }));
          })
          .finally(() => {
            setUploadingQuestions((prev) => ({ ...prev, [qId]: false }));
          });
      }
    } catch {
      // Ignore stop errors
    }
  }

  const handleRetake = () => {
    if (currentQuestion) {
      const qId = currentQuestion.id;
      setCurrentLocalUri(null);
      setCurrentLocalDuration(0);
      setRecordingDuration(0);
      setIsRecording(false);
      setRecording(null);
      setHasStartedRecording(false);
      setHasRecorded((prev) => ({ ...prev, [qId]: false }));
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  if (isError) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="flex-1 bg-slate-50"
      >
        <View className="flex-1 w-full items-center justify-center p-6">
          <View className="w-full max-w-sm bg-white dark:bg-[#1E1F2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm items-center justify-center">
            <View
              style={{
                width: 140,
                height: 140,
                marginBottom: 12,
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LottieView
                source={require("../../../assets/mascot/Error 404.lottie")}
                autoPlay
                loop
                style={{ width: "100%", height: "100%" }}
              />
            </View>

            <Text className="text-slate-900 dark:text-white font-extrabold text-xl text-center mb-2">
              Server Connection Lost
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center leading-5 mb-4 text-center">
              We couldn't connect to the learning server. Please ensure the backend service is
              running and try again.
            </Text>

            {/* Inline Arcade Offline Game (Chrome Dino Style) */}
            <OfflineGameView />

            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={() => refetch()}
                className="w-full bg-blue-500 active:bg-blue-600 py-4 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading || !sectionData) {
    return <GamifiedMascotLoader title="Preparing Speaking Assessment..." />;
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#151620]">
        <Text className="dark:text-white">No questions found for this section.</Text>
      </View>
    );
  }

  const handleFinish = async () => {
    const qId = currentQuestion?.id;
    if (uploadingQuestions[qId]) {
      Alert.alert("Uploading Audio", "Please wait for your last audio upload to complete.");
      return;
    }
    if (!answers[qId]) {
      Alert.alert(
        "Upload Error",
        "Last audio upload failed. Please tap 'Retake' and record again.",
      );
      return;
    }

    // Verify all questions have an answer
    const missingAny = questions.some((q) => !answers[q.id]);
    if (missingAny) {
      Alert.alert(
        "Incomplete Answers",
        "Some of your recordings were not uploaded successfully. Please review and record them again.",
      );
      return;
    }

    setIsFinished(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qid, val]) => ({
        question_id: qid,
        answer: val,
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

      // Poll/verify status
      await pollAssessmentScoringStatus(sessionId!, getAssessmentStatus);

      await saveCompletedSection("B_SPEAKING");
      await new Promise((res) => setTimeout(res, 600));

      const nextRoute = getNextRouteForSection(response.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err: any) {
      console.error("B_SPEAKING submission failed:", err);
      setIsFinished(false);
      const msg = getApiErrorMessage(err, "Could not submit answers.");
      Alert.alert("Submission Failed", msg);
    }
  };

  const handleNext = async () => {
    if (isRecording) {
      await stopRecording();
    }

    const qId = currentQuestion?.id;
    if (!hasRecorded[qId]) {
      Alert.alert("Recording Required", "Please record your answer before proceeding.");
      return;
    }

    if (uploadingQuestions[qId]) {
      Alert.alert("Uploading Audio", "Please wait for your audio upload to complete.");
      return;
    }

    if (!answers[qId]) {
      Alert.alert("Upload Error", "Audio upload failed. Please tap 'Retake' and record again.");
      return;
    }

    if (isLastQuestion) {
      handleFinish();
      return;
    }

    // Reset state synchronously to prevent race conditions on last question
    setHasStartedRecording(false);
    setTimeLeft(maxDuration + 5);
    setRecordingDuration(0);
    setIsRecording(false);
    setRecording(null);

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-white dark:bg-[#151620]"
    >
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
            stopTimer={isSubmitting || isFinished}
          />

          <SpeakingQuestion
            question={currentQuestion as any}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            timeLeft={timeLeft}
          />

          {currentLocalUri ? (
            <SpeakingFeedbackPlayback
              localUri={currentLocalUri}
              recordedDuration={currentLocalDuration}
              onRetake={handleRetake}
              onSubmit={handleNext}
              submitButtonText={isLastQuestion ? "Check Answers" : "Next Question"}
              isSubmitting={isSubmitting || (isLastQuestion && isAnyUploading)}
            />
          ) : (
            <>
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
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full-screen lock overlay — blocks all interaction during submission */}
      {(isFinished || isSubmitting) && (
        <View className="absolute inset-0 bg-black/60 items-center justify-center z-[9999]">
          <View className="bg-white dark:bg-[#1E1F2A] rounded-2xl py-9 px-10 items-center shadow-lg min-w-[240px] border border-slate-100 dark:border-slate-800">
            <LottieView
              source={require("../../../assets/mascot/Dino Loading.json")}
              autoPlay
              loop
              style={{ width: 40, height: 40 }}
            />
            <Text className="text-slate-800 dark:text-white font-bold text-base mt-2">
              Submitting Answers…
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 text-center">
              Please wait, do not close the app
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

interface SpeakingScreenProps {
  sessionId?: string;
}
