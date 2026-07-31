/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  getNextRouteForSection,
  AListenSectionResponse,
  useLazyGetAssessmentStatusQuery,
} from "@/services/assessment-api";
import { ListenWithAudioQuestion } from "./components/ListenWithAudioQuestion";
import { AudioPlayer } from "./components/AudioPlayer";
import { RecordingButton } from "./components/RecordingButton";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { Platform } from "react-native";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { SpeakingFeedbackPlayback } from "@/components/assessment/SpeakingFeedbackPlayback";
import LottieView from "lottie-react-native";
import { OfflineGameView } from "@/components/OfflineGameView";

import { Audio } from "expo-av";
import { uploadAudioFile } from "@/services/audio-upload";
import { getApiErrorMessage } from "@/utils/error-message";
import { pollAssessmentScoringStatus } from "@/utils/assessment-poll";
import { showAlert } from "@/utils/alert";

const getOptimizedRecordingSettings = (): any => {
  return {
    android: {
      extension: ".m4a",
      outputFormat: 2,
      audioEncoder: 3,
      sampleRate: 8000,
      numberOfChannels: 1,
      bitRate: 16000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: "aac ",
      audioQuality: 0,
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

export function ListenWithAudioScreen({ sessionId: propSessionId }: ListenWithAudioScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sessionId, setSessionId] = useState<string | undefined>(propSessionId);
  const scrollViewRef = useRef<ScrollView>(null);

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
    { session_id: sessionId!, section: "A_LISTEN" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();
  const [getAssessmentStatus] = useLazyGetAssessmentStatusQuery();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasRecorded, setHasRecorded] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [hasAudioFinished, setHasAudioFinished] = useState(false);

  const listenData = sectionData as AListenSectionResponse | undefined;
  const questions = listenData?.items || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const [isRecording, setIsRecording] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<any>(null);

  const [uploadingQuestions, setUploadingQuestions] = useState<Record<string, boolean>>({});
  const isAnyUploading = Object.values(uploadingQuestions).some(Boolean);
  // Tracks in-flight upload promises per question so handleFinish can await
  // them before reading `answers`. Without this, a fast tap-through after the
  // last recording would submit with audio_url=undefined.
  const pendingUploadsRef = useRef<Record<string, Promise<string | void>>>({});

  const [currentLocalUri, setCurrentLocalUri] = useState<string | null>(null);
  const [currentLocalDuration, setCurrentLocalDuration] = useState<number>(0);

  const getListeningDuration = () => {
    const complexity = String(currentQuestion?.complexity || "")
      .toLowerCase()
      .trim();
    if (complexity === "easy" || complexity === "medium") {
      return 15;
    }
    if (complexity === "hard" || complexity === "difficult" || complexity === "advanced") {
      return 30;
    }
    return currentQuestion?.recording_time_seconds || 30;
  };

  const maxDuration = getListeningDuration();
  useEffect(() => {
    if (currentQuestion) {
      setRecordingDuration(0);
      setIsRecording(false);
      setRecording(null);
      setHasStartedRecording(false);
      setCurrentLocalUri(null);
      setCurrentLocalDuration(0);
      setHasAudioFinished(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentQuestionIndex, currentQuestion, maxDuration]);

  // Auto-stop recording if maxDuration is reached
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
    if (!hasAudioFinished) {
      showAlert("Locked", "Please listen to the audio completely before recording.");
      return;
    }
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        showAlert("Permission", "Microphone access is required.");
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
      }
    } catch (err) {
      showAlert("Failed to start recording", (err as Error).message);
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

        const uploadPromise = uploadAudioFile(uri, "recording.m4a")
          .then((sasUrl) => {
            setAnswers((prev) => ({ ...prev, [qId]: sasUrl }));
            return sasUrl;
          })
          .catch((err) => {
            // Background upload failure handler with user alerts
            console.error("Audio upload failed:", err);
            showAlert(
              "Upload Failed",
              "We had trouble uploading your audio. Please tap 'Retake' and try recording again.",
            );
            // Reset recorded states on failure
            setHasRecorded((prev) => ({ ...prev, [qId]: false }));
            setAnswers((prev) => {
              const next = { ...prev };
              delete next[qId];
              return next;
            });
            setCurrentLocalUri(null);
            setCurrentLocalDuration(0);
          })
          .finally(() => {
            setUploadingQuestions((prev) => ({ ...prev, [qId]: false }));
            delete pendingUploadsRef.current[qId];
          });
        pendingUploadsRef.current[qId] = uploadPromise;
        return uploadPromise;
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
              Connection Timeout
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center leading-5 mb-4 px-4 text-center">
              Could not load listening section due to network delay. Please try again.
            </Text>

            {/* Inline Arcade Offline Game (Chrome Dino Style) */}
            <OfflineGameView />

            <View className="w-full gap-3 mt-2">
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
    return <GamifiedMascotLoader title="Preparing Listening Assessment..." />;
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#151620]">
        <Text className="dark:text-white">No questions found for this section.</Text>
      </View>
    );
  }

  const handleFinish = async () => {
    // Prevent proceeding during active background audio upload
    const pendingQIds = Object.keys(uploadingQuestions).filter(
      (qId) => uploadingQuestions[qId] === true,
    );
    if (pendingQIds.length > 0 || isAnyUploading) {
      showAlert(
        "Upload in Progress",
        "Your recorded answer is still uploading. Please wait a few seconds and try again.",
      );
      return;
    }

    // Verify all questions have answers
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      showAlert("Incomplete Answers", "Please record and upload your answer before proceeding.");
      return;
    }

    setIsFinished(true);
    try {
      // Wait for any in-flight audio uploads to settle before reading answers,
      // otherwise the last question's audio_url may still be undefined.
      const pending = Object.values(pendingUploadsRef.current);
      if (pending.length > 0) {
        await Promise.allSettled(pending);
      }

      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        answer: val,
        audio_url: val,
      }));

      let response: any = null;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await submitSection({
            session_id: sessionId!,
            section: "A_LISTEN",
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

      await saveCompletedSection("A_LISTEN");
      await new Promise((res) => setTimeout(res, 600));

      const nextRoute = getNextRouteForSection(response.next_section);
      router.replace({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err: any) {
      console.error("A_LISTEN submission failed:", err);
      const msg = getApiErrorMessage(err, "Could not submit answers.");
      showAlert("Submission Failed", msg);
      setIsFinished(false);
    }
  };

  const handleNext = async () => {
    if (isRecording) {
      await stopRecording();
    }

    const currentQId = currentQuestion?.id || "";

    // Gating transitions if background audio upload is still in progress
    if (uploadingQuestions[currentQId] === true) {
      showAlert(
        "Upload In Progress",
        "Please wait a few seconds for your audio recording to finish uploading.",
      );
      return;
    }

    if (!hasRecorded[currentQId] || !answers[currentQId]) {
      showAlert("Recording Required", "Please record your answer before proceeding.");
      return;
    }

    if (isLastQuestion) {
      await handleFinish();
      return;
    }

    // Reset state synchronously to prevent race conditions on last question
    setHasStartedRecording(false);
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
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AssessmentHeader
            sectionName="Section A"
            skillName="Expressive Speaking"
            currentQuestion={currentQuestionIndex}
            totalQuestions={questions.length}
            onFinishTest={handleFinish}
            sessionId={sessionId}
            stopTimer={isSubmitting || isFinished}
          />

          <ListenWithAudioQuestion
            question={currentQuestion as any}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
          />

          <AudioPlayer
            audioUrl={currentQuestion?.audio_url}
            audioText={currentQuestion?.text || "Please listen to the audio carefully."}
            duration={currentQuestion?.recording_time_seconds || 30}
            onPlayEnd={() => setHasAudioFinished(true)}
          />

          {currentLocalUri ? (
            <SpeakingFeedbackPlayback
              localUri={currentLocalUri}
              recordedDuration={currentLocalDuration}
              onRetake={handleRetake}
              onSubmit={handleNext}
              submitButtonText={isLastQuestion ? "Next Section" : "Next Question"}
              isSubmitting={isSubmitting || (isLastQuestion && isAnyUploading)}
            />
          ) : (
            <>
              <RecordingButton
                isRecording={isRecording}
                recordingDuration={recordingDuration}
                maxDuration={maxDuration}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                disabled={!hasAudioFinished}
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
              style={{ width: 140, height: 140 }}
            />
            <Text className="text-slate-800 dark:text-white font-bold text-lg mt-4 text-center">
              Submitting Answers…
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center px-4">
              Please wait, do not close the app
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

interface ListenWithAudioScreenProps {
  sessionId?: string;
}
