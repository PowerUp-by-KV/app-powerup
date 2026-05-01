import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAnswerMode } from "@/store/slices/mock-interview.slice";
import { useGetNextQuestionQuery, useSubmitAnswerMutation } from "@/services/mock-interview-api";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";

// ---------------------------------------------------------------------------
// Sub-component: ProgressBar
// ---------------------------------------------------------------------------

interface ProgressBarProps {
  current: number;
  total: number;
}

function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
      <View className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: MicIcon  (drawn with Views, no SVG dependency)
// ---------------------------------------------------------------------------

function MicIcon({ color = "#fff" }: { color?: string }) {
  return (
    <View className="items-center">
      {/* Mic capsule */}
      <View
        style={{
          width: 12,
          height: 18,
          borderRadius: 6,
          backgroundColor: color,
        }}
      />
      {/* Mic arm */}
      <View
        style={{
          width: 20,
          height: 10,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          marginTop: -1,
        }}
      />
      {/* Stand */}
      <View style={{ width: 2, height: 4, backgroundColor: color }} />
      <View style={{ width: 12, height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: VoiceRecorderCard
// ---------------------------------------------------------------------------

interface VoiceRecorderCardProps {
  isRecording: boolean;
  onToggle: () => void;
}

function VoiceRecorderCard({ isRecording, onToggle }: VoiceRecorderCardProps) {
  return (
    <View
      className="bg-white rounded-2xl p-10 items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Pressable onPress={onToggle} style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>
        <View
          className={`w-16 h-16 rounded-full items-center justify-center ${
            isRecording ? "bg-red-400" : "bg-blue-500"
          }`}
        >
          {isRecording ? (
            // Stop square
            <View className="w-5 h-5 bg-white rounded-sm" />
          ) : (
            <MicIcon />
          )}
        </View>
      </Pressable>

      <Text className="text-sm font-semibold text-gray-800 mt-5">
        {isRecording ? "Recording..." : "Tap to record"}
      </Text>
      {isRecording && <Text className="text-xs text-gray-400 mt-1">Tap again to stop</Text>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: TextAnswerCard
// ---------------------------------------------------------------------------

interface TextAnswerCardProps {
  value: string;
  onChange: (text: string) => void;
}

function TextAnswerCard({ value, onChange }: TextAnswerCardProps) {
  return (
    <View
      className="bg-white rounded-2xl overflow-hidden border-2 border-blue-400"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline
        placeholder="Type your answer here..."
        placeholderTextColor="#D1D5DB"
        className="p-4 text-sm text-gray-900"
        style={{ minHeight: 160, textAlignVertical: "top" }}
        autoFocus
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export function MockInterviewQuestionScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ── Redux ─────────────────────────────────────────────────────────────────
  const sessionId = useAppSelector((s) => s.mockInterview.sessionId);
  const currentQuestionText = useAppSelector((s) => s.mockInterview.currentQuestionText);
  const currentQuestionId = useAppSelector((s) => s.mockInterview.currentQuestionId);
  const currentQuestionOrder = useAppSelector((s) => s.mockInterview.currentQuestionOrder);
  const totalQuestions = useAppSelector((s) => s.mockInterview.totalQuestions);
  const answerMode = useAppSelector((s) => s.mockInterview.answerMode);
  const isComplete = useAppSelector((s) => s.mockInterview.isComplete);

  // ── Local state (justified: text input is single-component, resets on leave) ──
  const [typedAnswer, setTypedAnswer] = useState("");

  // ── RTK Query ─────────────────────────────────────────────────────────────
  // onQueryStarted in mock-interview-api.ts auto-dispatches setCurrentQuestion
  // or markComplete into Redux — no manual dispatch needed here.
  const { isLoading: isLoadingQuestion, isError: questionError } = useGetNextQuestionQuery(
    sessionId ?? "",
    { skip: !sessionId },
  );

  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation();

  // ── Voice recorder ────────────────────────────────────────────────────────
  const { isRecording, audioFile, startRecording, stopRecording } = useVoiceRecorder();

  // ── Navigate to result when the API signals the session is done ───────────
  useEffect(() => {
    if (isComplete) {
      router.replace("/mock-interview/result" as any);
    }
  }, [isComplete, router]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleToggleMode = useCallback(() => {
    dispatch(setAnswerMode(answerMode === "voice" ? "text" : "voice"));
  }, [dispatch, answerMode]);

  const handleVoiceToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !currentQuestionId) return;
    try {
      await submitAnswer({
        sessionId,
        questionId: currentQuestionId,
        audioFile: answerMode === "voice" ? (audioFile ?? undefined) : undefined,
        transcript: answerMode === "text" ? typedAnswer : undefined,
      }).unwrap();

      // onQueryStarted in the api service dispatches addFeedback to Redux,
      // so the Feedback screen can read it immediately without another call.
      setTypedAnswer("");
      router.push("/mock-interview/feedback" as any);
    } catch {
      // TODO: wire up toast utility
    }
  }, [sessionId, currentQuestionId, answerMode, audioFile, typedAnswer, submitAnswer, router]);

  // ── Submit button readiness ───────────────────────────────────────────────
  const voiceReady = answerMode === "voice" && audioFile !== null && !isRecording;
  const textReady = answerMode === "text" && typedAnswer.trim().length > 0;
  const canSubmit = (voiceReady || textReady) && !isSubmitting;

  // ── States: loading / error ───────────────────────────────────────────────

  if (isLoadingQuestion) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (questionError) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center px-10">
        <Text className="text-gray-500 text-sm text-center leading-6">
          Failed to load the next question.{"\n"}Please check your connection.
        </Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <Text className="text-xs font-medium text-gray-500">
          Question {currentQuestionOrder} of {totalQuestions}
        </Text>
        <ProgressBar current={currentQuestionOrder} total={totalQuestions} />

        {/* Question card */}
        <View
          className="bg-white rounded-2xl p-5 mt-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-sm text-gray-800 leading-6">{currentQuestionText}</Text>
        </View>

        {/* Answer area */}
        <View className="mt-4">
          {answerMode === "voice" ? (
            <VoiceRecorderCard isRecording={isRecording} onToggle={handleVoiceToggle} />
          ) : (
            <TextAnswerCard value={typedAnswer} onChange={setTypedAnswer} />
          )}
        </View>

        {/* Mode toggle link */}
        <Pressable
          onPress={handleToggleMode}
          className="flex-row items-center justify-center mt-5 py-1"
          style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
        >
          <Text className="text-xs text-gray-500 mr-1.5">
            {answerMode === "voice" ? "⌨️" : "🎙️"}
          </Text>
          <Text className="text-xs text-gray-500">
            {answerMode === "voice" ? "Type answer instead" : "Record answer instead"}
          </Text>
        </Pressable>

        {/* Spacer to clear sticky footer */}
        <View className="h-24" />
      </ScrollView>

      {/* Sticky Submit footer */}
      <View className="px-5 pb-10 pt-4 bg-gray-100">
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`rounded-2xl py-4 items-center justify-center ${
            canSubmit ? "bg-blue-500" : "bg-gray-200"
          }`}
          style={({ pressed }) => ({
            opacity: pressed && canSubmit ? 0.82 : 1,
          })}
        >
          {isSubmitting ? (
            <ActivityIndicator color={canSubmit ? "#fff" : "#9CA3AF"} />
          ) : (
            <Text
              className={`font-semibold text-base ${canSubmit ? "text-white" : "text-gray-400"}`}
            >
              Submit Answer
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
