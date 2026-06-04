import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {
  useCompleteSessionMutation,
  useGetAssessmentStatusQuery,
  useLazyGetAssessmentResultQuery,
  AssessmentResultResponse,
  AssessmentScoringStatusResponse,
} from "@/services/assessment-api";
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

  const [completeSession, { data: rawResultData, isLoading, error }] = useCompleteSessionMutation();
  const [triggerGetResult, { data: lazyResult }] = useLazyGetAssessmentResultQuery();
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [statusData, setStatusData] = useState<AssessmentScoringStatusResponse | null>(null);

  const handleSkipAndCalculate = async () => {
    setIsPolling(false);
    if (sessionId) {
      try {
        await triggerGetResult({ session_id: sessionId }).unwrap();
      } catch {
        Alert.alert(
          "Results Pending",
          "Your speaking audios are still being processed on the backend. Please give it a few more seconds to prepare your initial CEFR calculation!",
          [
            {
              text: "Wait",
              onPress: () => setIsPolling(true),
            },
            {
              text: "Go Home",
              onPress: handleBack,
            },
          ],
        );
      }
    }
  };

  // Poll the status API every 3 seconds only when isPolling is true
  const { data: currentStatus } = useGetAssessmentStatusQuery(
    { session_id: sessionId || "" },
    { skip: !sessionId || !isPolling, pollingInterval: 3000 },
  );

  useEffect(() => {
    if (sessionId && !hasTriggered) {
      completeSession({ session_id: sessionId });
      setHasTriggered(true);
    }
  }, [sessionId, hasTriggered, completeSession]);

  // Handle status update from polling query
  useEffect(() => {
    if (currentStatus) {
      setStatusData(currentStatus);
      if (currentStatus.pending_answers === 0) {
        // Scoring is completed! Re-fetch results and stop polling.
        setIsPolling(false);
        completeSession({ session_id: sessionId! });
      }
    }
  }, [currentStatus, sessionId, completeSession]);

  // Watch mutation result
  useEffect(() => {
    if (rawResultData) {
      if ("percentage" in rawResultData) {
        setIsPolling(false);
      } else {
        // Not scored yet: start polling and save initial status
        setIsPolling(true);
        setStatusData(rawResultData as AssessmentScoringStatusResponse);
      }
    }
  }, [rawResultData]);

  const handleBack = () => {
    router.replace("/(tabs)/my-learning" as never);
  };

  const handleTryAgain = () => {
    if (sessionId) {
      setIsPolling(true);
      completeSession({ session_id: sessionId });
    }
  };

  const resultData = (rawResultData || lazyResult) as AssessmentResultResponse | undefined;

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
  if (total > 0 && (pending === 0 || completed === total)) {
    loaderTitle = "Calculating your CEFR results...";
  }

  if (isLoading || isPolling) {
    return (
      <GamifiedMascotLoader
        title={loaderTitle}
        buttonText={isPolling ? "Skip Wait & Show Results" : undefined}
        onButtonPress={isPolling ? handleSkipAndCalculate : undefined}
      />
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center px-6">
        <View className="items-center mb-4 self-center">
          <LottieView
            source={require("../../../assets/mascot/Error 404.lottie")}
            autoPlay
            loop
            style={{ width: 140, height: 140, marginBottom: 12 }}
          />
          <Text className="text-2xl font-black text-white text-center mb-2">
            Connection Timeout
          </Text>
          <Text className="text-slate-400 text-center text-sm mb-4 px-4">
            We had trouble reaching our servers. Keep yourself entertained with Dino Dash while we
            reconnect!
          </Text>
        </View>

        {/* Playable Offline Game View */}
        <View className="w-full max-w-sm mb-6 self-center">
          <OfflineGameView />
        </View>

        <View className="flex-row gap-4 w-full max-w-sm justify-center self-center">
          <TouchableOpacity
            className="flex-1 bg-blue-500 active:bg-blue-600 py-3.5 rounded-2xl items-center shadow-md active:scale-95"
            onPress={handleTryAgain}
          >
            <Text className="text-white font-bold text-base">Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white active:bg-slate-50 py-3.5 rounded-2xl items-center border border-slate-200 active:scale-95"
            onPress={handleBack}
          >
            <Text className="text-slate-700 font-bold text-base">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!resultData || !("percentage" in resultData)) {
    return (
      <GamifiedMascotLoader
        title={loaderTitle}
        buttonText="Skip Wait & Show Results"
        onButtonPress={handleSkipAndCalculate}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
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
    </SafeAreaView>
  );
}

export default ResultsScreen;
