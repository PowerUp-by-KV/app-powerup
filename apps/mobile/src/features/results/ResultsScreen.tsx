/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {
  useCompleteSessionMutation,
  useGetAssessmentStatusQuery,
  useGetUserAssessmentResultQuery,
  AssessmentResultResponse,
  AssessmentScoringStatusResponse,
} from "@/services/assessment-api";
import { useGetProfileQuery } from "@/services/auth-api";
import { ScoreGauge } from "./components/ScoreGauge";
import { ScoreCard } from "./components/ScoreCard";
import {
  getAssessmentSessionId,
  getAssessmentStartTime,
  clearAssessmentStartTime,
  savePreAssessmentResults,
  getPreAssessmentResults,
  setPreAssessmentCompletedInSession,
} from "@/services/auth-storage";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { OfflineGameView } from "@/components/OfflineGameView";
import { refreshAccessToken } from "@/services/api";

interface ResultsScreenProps {
  sessionId?: string;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function ResultsScreen({ sessionId: propSessionId }: ResultsScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sessionId, setSessionId] = useState<string | undefined>(propSessionId);
  const [timeTaken, setTimeTaken] = useState<string | null>(null);

  useEffect(() => {
    getAssessmentStartTime().then((startTime) => {
      if (startTime) {
        const elapsed = Date.now() - startTime;
        setTimeTaken(formatDuration(elapsed));
        clearAssessmentStartTime();
      } else {
        // Fallback: check if we have a saved pre-assessment result with a saved timeTaken
        getPreAssessmentResults().then((saved) => {
          if (saved && saved.timeTaken) {
            setTimeTaken(saved.timeTaken);
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!sessionId) {
      getAssessmentSessionId().then((id) => {
        if (id) setSessionId(id);
      });
    }
  }, [sessionId]);

  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
  const shouldUseUserId = !!profile?.id && (!!profile?.cefr_range || !sessionId);

  const {
    data: userResultData,
    isLoading: isUserResultLoading,
    error: userResultError,
    refetch: refetchUserResult,
  } = useGetUserAssessmentResultQuery({ user_id: profile?.id || "" }, { skip: !shouldUseUserId });

  const [completeSession, { data: rawResultData, isLoading, error }] = useCompleteSessionMutation();
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [statusData, setStatusData] = useState<AssessmentScoringStatusResponse | null>(null);
  const pollCountRef = useRef(0);

  // Poll the status API every 3 seconds only when isPolling is true
  const { data: currentStatus } = useGetAssessmentStatusQuery(
    { session_id: sessionId || "" },
    { skip: !sessionId || !isPolling, pollingInterval: 3000 },
  );

  useEffect(() => {
    if (isProfileLoading) return;
    if (sessionId && !hasTriggered && !shouldUseUserId) {
      completeSession({ session_id: sessionId });
      setHasTriggered(true);
    }
  }, [sessionId, hasTriggered, completeSession, shouldUseUserId, isProfileLoading]);

  // Handle status update from polling query
  useEffect(() => {
    if (currentStatus) {
      setStatusData(currentStatus);
      const processed = currentStatus.completed_answers + currentStatus.failed_answers;
      const total = currentStatus.total_answers;

      // Stop polling and finalize if:
      // 1. pending_answers reaches 0
      // 2. Or all answers have been processed (completed + failed equals total)
      // 3. Or we have polled 6 times (18 seconds) as a safety timeout
      if (
        currentStatus.pending_answers === 0 ||
        (total > 0 && processed >= total) ||
        pollCountRef.current >= 6
      ) {
        setIsPolling(false);
        pollCountRef.current = 0;
        completeSession({ session_id: sessionId! });
      } else {
        pollCountRef.current += 1;
      }
    }
  }, [currentStatus, sessionId, completeSession]);

  // Watch mutation result
  useEffect(() => {
    if (rawResultData) {
      if ("percentage" in rawResultData) {
        setIsPolling(false);
        pollCountRef.current = 0;
      } else {
        // Not scored yet: start polling and save initial status
        setIsPolling(true);
        setStatusData(rawResultData as AssessmentScoringStatusResponse);
      }
    }
  }, [rawResultData]);

  const handleBack = async () => {
    try {
      await refreshAccessToken();
    } catch (e) {
      console.warn("Failed to refresh access token after assessment:", e);
    }
    router.replace("/(tabs)/my-learning" as never);
  };

  const handleTryAgain = () => {
    if (shouldUseUserId) {
      refetchUserResult?.();
    } else if (sessionId) {
      setIsPolling(true);
      pollCountRef.current = 0;
      completeSession({ session_id: sessionId });
    }
  };

  const resultData = (rawResultData || userResultData) as AssessmentResultResponse | undefined;

  useEffect(() => {
    if (resultData && "percentage" in resultData) {
      const merged = {
        ...resultData,
        timeTaken: timeTaken || undefined,
      };
      savePreAssessmentResults(merged).catch((err) => {
        console.warn("Failed to save preassessment results:", err);
      });
      setPreAssessmentCompletedInSession(true).catch((err) => {
        console.warn("Failed to set preassessment completed flag:", err);
      });
    }
  }, [resultData, timeTaken]);

  const sectionCards = resultData?.section_percentages
    ? [
        { id: "reading", title: "Reading", key: "A_READING", icon: "book-open" as const },
        { id: "speak-read", title: "Speak by Reading", key: "A_SPEAKING", icon: "mic" as const },
        {
          id: "listen-repeat",
          title: "Listen & Repeat",
          key: "A_LISTEN",
          icon: "volume-2" as const,
        },
        {
          id: "open-speaking",
          title: "Open Speaking",
          key: "B_SPEAKING",
          icon: "message-circle" as const,
        },
        { id: "grammar", title: "Grammar", key: "C_GRAMMAR", icon: "edit-3" as const },
        {
          id: "listening",
          title: "Listening",
          key: "D_LISTEN_ANSWER",
          icon: "headphones" as const,
        },
      ].map((item) => ({
        ...item,
        score: resultData.section_percentages?.[item.key] ?? 0,
      }))
    : [];

  const total = statusData?.total_answers || 0;
  const completed = statusData?.completed_answers || 0;
  const pending = statusData?.pending_answers ?? -1;

  let loaderTitle = "Analyzing your response...";
  if (shouldUseUserId) {
    loaderTitle = "Loading your CEFR results...";
  } else if (total > 0 && (pending === 0 || completed === total)) {
    loaderTitle = "Calculating your CEFR results...";
  }

  const isFetchingResults = isLoading || isPolling || (shouldUseUserId && isUserResultLoading);
  const hasError = error || (shouldUseUserId && userResultError);

  if (isFetchingResults) {
    return <GamifiedMascotLoader title={loaderTitle} />;
  }

  if (hasError) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: "#f8fafc",
        }}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 360,
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 24,
              padding: 24,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
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

            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: "#0f172a",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Connection Timeout
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 18,
                marginBottom: 16,
                paddingHorizontal: 8,
              }}
            >
              We had trouble reaching our servers. Keep yourself entertained with Dino Dash while we
              reconnect!
            </Text>

            {/* Playable Offline Game View */}
            <View style={{ width: "100%", marginBottom: 16 }}>
              <OfflineGameView />
            </View>

            <View
              style={{ flexDirection: "row", gap: 12, width: "100%", justifyContent: "center" }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#3b82f6",
                  paddingVertical: 12,
                  borderRadius: 16,
                  alignItems: "center",
                }}
                onPress={handleTryAgain}
              >
                <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#ffffff",
                  paddingVertical: 12,
                  borderRadius: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#cbd5e1",
                }}
                onPress={handleBack}
              >
                <Text style={{ color: "#475569", fontWeight: "700", fontSize: 14 }}>
                  Back to Home
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!resultData || !("percentage" in resultData)) {
    return <GamifiedMascotLoader title={loaderTitle} />;
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-white"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 32,
            flexGrow: 1,
            paddingBottom: 50,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-4">
            <Text className="text-slate-500 font-bold text-lg mb-2 uppercase tracking-wide">
              Overall Score
            </Text>
            <ScoreGauge
              score={resultData.percentage || 0}
              total={100}
              obtainedPoints={Math.round(resultData.total_score || 0)}
              totalPoints={Math.round(resultData.max_score || 100)}
              cefr={resultData.cefr_level ?? resultData.cefr_range ?? "N/A"}
            />
            {timeTaken && (
              <View className="flex-row items-center bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5 mt-5">
                <Feather name="clock" size={18} color="#3b82f6" className="mr-2" />
                <Text className="text-blue-900 font-bold text-sm">
                  Total Time Taken: <Text className="text-blue-600">{timeTaken}</Text>
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row flex-wrap justify-between mt-6">
            {sectionCards.map((cat) => (
              <ScoreCard
                key={cat.id}
                title={cat.title}
                score={cat.score}
                total={100}
                icon={cat.icon as any}
              />
            ))}
          </View>

          <TouchableOpacity
            className="bg-blue-500 active:bg-blue-600 py-4 rounded-2xl items-center mt-12 mb-6 shadow-sm active:opacity-90"
            onPress={handleBack}
          >
            <Text className="text-white text-lg font-bold">Go to My Learning</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default ResultsScreen;
