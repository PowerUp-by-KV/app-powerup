import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/store/slices/mock-interview.slice";
import {
  useStartInterviewMutation,
  useGetPastAttemptsQuery,
  type InterviewAttempt,
} from "@/services/mock-interview-api";

// ---------------------------------------------------------------------------
// Sub-component: CheckCircleIcon
// ---------------------------------------------------------------------------

function CheckCircleIcon() {
  return (
    <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
      <View className="w-6 h-6 rounded-full border-2 border-blue-500 items-center justify-center">
        <View
          style={{
            width: 10,
            height: 6,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
            borderColor: "#3B82F6",
            transform: [{ rotate: "-45deg" }],
            marginTop: -2,
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ClockIcon
// ---------------------------------------------------------------------------

function ClockIcon() {
  return (
    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
      <View className="w-6 h-6 rounded-full border-2 border-gray-400 items-center justify-center">
        {/* 12 o'clock hand */}
        <View
          style={{
            position: "absolute",
            width: 1.5,
            height: 5,
            backgroundColor: "#9CA3AF",
            top: 1,
            left: 8.5,
            borderRadius: 1,
          }}
        />
        {/* 3 o'clock hand */}
        <View
          style={{
            position: "absolute",
            width: 4,
            height: 1.5,
            backgroundColor: "#9CA3AF",
            top: 8.5,
            left: 8.5,
            borderRadius: 1,
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: AttemptCard
// ---------------------------------------------------------------------------

interface AttemptCardProps {
  attempt: InterviewAttempt;
  onPress: (attempt: InterviewAttempt) => void;
}

function AttemptCard({ attempt, onPress }: AttemptCardProps) {
  const isCompleted = attempt.status === "completed";

  const formattedDate = new Date(attempt.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Pressable
      onPress={() => onPress(attempt)}
      className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      })}
    >
      {isCompleted ? <CheckCircleIcon /> : <ClockIcon />}

      <View className="flex-1 ml-4">
        <Text className="text-sm font-semibold text-gray-900">
          {isCompleted && attempt.score !== null ? `Score: ${attempt.score}/10` : "In Progress"}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">{formattedDate}</Text>
      </View>

      {/* Chevron */}
      <Text className="text-gray-300 text-lg">›</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export function MockInterviewLobbyScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    data: attemptsData,
    isLoading: isLoadingAttempts,
    isError: attemptsError,
  } = useGetPastAttemptsQuery();

  const [startInterview, { isLoading: isStarting }] = useStartInterviewMutation();

  // ── Tap on existing attempt: resume if in-progress, view result if done ───
  const handleAttemptPress = useCallback(
    (attempt: InterviewAttempt) => {
      dispatch(
        setSession({
          sessionId: attempt.id,
          totalQuestions: attempt.total_questions,
          status: attempt.status,
        }),
      );

      if (attempt.status === "in_progress") {
        // getNextQuestion in QuestionScreen picks up from where user left off
        router.push("/mock-interview/question" as any);
      } else {
        router.push("/mock-interview/result" as any);
      }
    },
    [dispatch, router],
  );

  // ── Start a fresh session ─────────────────────────────────────────────────
  const handleStartNew = useCallback(async () => {
    try {
      const result = await startInterview({
        cefr_level: "B1-B2",
        domain: "IT",
        total_questions: 8,
      }).unwrap();

      dispatch(
        setSession({
          sessionId: result.id,
          totalQuestions: result.total_questions,
          status: result.status,
        }),
      );

      router.push("/mock-interview/question" as any);
    } catch {
      // TODO: wire up toast utility once available in the project
    }
  }, [startInterview, dispatch, router]);

  const attempts = attemptsData?.attempts ?? [];
  // Treat stubbed-endpoint errors as empty list silently
  const showEmptyState = attemptsError || (!isLoadingAttempts && attempts.length === 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 52 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-1">Mock Interview</Text>
        <Text className="text-sm text-gray-500 mb-8">Practice real interview questions</Text>

        {/* Past attempts section */}
        {isLoadingAttempts && <ActivityIndicator size="small" color="#3B82F6" className="mt-8" />}

        {!isLoadingAttempts && !showEmptyState && (
          <>
            <Text className="text-base font-bold text-gray-900 mb-4">Past Attempts</Text>
            {attempts.map((attempt) => (
              <AttemptCard key={attempt.id} attempt={attempt} onPress={handleAttemptPress} />
            ))}
          </>
        )}

        {showEmptyState && (
          <View className="items-center py-16">
            <Text className="text-gray-400 text-sm text-center leading-6">
              No past attempts yet.{"\n"}Start your first interview below!
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Sticky footer */}
      <View className="px-5 pb-10 pt-4 bg-gray-100">
        <Pressable
          onPress={handleStartNew}
          disabled={isStarting}
          className="bg-blue-500 rounded-2xl py-4 items-center justify-center"
          style={({ pressed }) => ({
            opacity: pressed || isStarting ? 0.82 : 1,
          })}
        >
          {isStarting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-base">Start New Interview</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
