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
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  getNextRouteForSection,
  AListenSectionResponse,
} from "@/services/assessment-api";
import { ListenWithAudioQuestion } from "./components/ListenWithAudioQuestion";
import { AudioPlayer } from "./components/AudioPlayer";
import { RecordingButton } from "./components/RecordingButton";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { Platform } from "react-native";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { SpeakingFeedbackPlayback } from "@/components/assessment/SpeakingFeedbackPlayback";

import { Audio } from "expo-av";
import { uploadAudioFile } from "@/services/audio-upload";

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
    { session_id: sessionId!, section: "A_LISTEN" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasRecorded, setHasRecorded] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  const listenData = sectionData as AListenSectionResponse | undefined;
  const questions = listenData?.items || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const [isRecording, setIsRecording] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(45); // Default 45s
  const [uploadingQuestions, setUploadingQuestions] = useState<Record<string, boolean>>({});
  const isAnyUploading = Object.values(uploadingQuestions).some(Boolean);

  const [currentLocalUri, setCurrentLocalUri] = useState<string | null>(null);
  const [currentLocalDuration, setCurrentLocalDuration] = useState<number>(0);

  const maxDuration = currentQuestion?.recording_time_seconds || 30;

  // Reset timer on question change
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(maxDuration + 10);
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
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg font-bold text-slate-800 text-center mb-2">
          Connection Timeout
        </Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          Could not load listening section due to network delay. Please try again.
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
    return <GamifiedMascotLoader title="Preparing Listening Assessment..." />;
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>No questions found for this section.</Text>
      </View>
    );
  }

  const handleFinish = async () => {
    setIsFinished(true);
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

      await saveCompletedSection("A_LISTEN");
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

    if (!hasRecorded[currentQuestion?.id]) {
      Alert.alert("Recording Required", "Please record your answer before proceeding.");
      return;
    }

    if (isLastQuestion) {
      handleFinish();
      return;
    }

    // Reset state synchronously to prevent race conditions on last question
    setHasStartedRecording(false);
    setTimeLeft(maxDuration + 10);
    setRecordingDuration(0);
    setIsRecording(false);
    setRecording(null);

    setCurrentQuestionIndex((prev) => prev + 1);
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
            timeLeft={timeLeft}
          />

          <AudioPlayer
            audioUrl={currentQuestion?.audio_url}
            audioText={currentQuestion?.text || "Please listen to the audio carefully."}
            duration={currentQuestion?.recording_time_seconds || 30}
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
              <RecordingButton
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
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.title}>Submitting Answers…</Text>
            <Text style={styles.subtitle}>Please wait, do not close the app</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 240,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 18,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },
});

interface ListenWithAudioScreenProps {
  sessionId?: string;
}
