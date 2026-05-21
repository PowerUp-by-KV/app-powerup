import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useCompleteSessionMutation, AssessmentResultResponse } from "@/services/assessment-api";
import { ScoreGauge } from "./components/ScoreGauge";
import { ScoreCard } from "./components/ScoreCard";
import {
  getAssessmentSessionId,
  getAssessmentStartTime,
  clearAssessmentStartTime,
} from "@/services/auth-storage";

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
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (sessionId && !hasTriggered) {
      completeSession({ session_id: sessionId });
      setHasTriggered(true);
    }
  }, [sessionId, hasTriggered, completeSession]);

  const handleBack = () => {
    router.replace("/(tabs)/my-learning" as never);
  };

  const resultData = rawResultData as AssessmentResultResponse | undefined;

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
        score: resultData.section_percentages[item.key] ?? 0,
      }))
    : [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error || !resultData || !("percentage" in resultData)) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg text-slate-600 text-center mb-6">
          Scoring in progress or could not load assessment results. Please check back shortly.
        </Text>
        <TouchableOpacity className="bg-slate-900 py-3 px-8 rounded-xl" onPress={handleBack}>
          <Text className="text-white font-bold">Back to Home</Text>
        </TouchableOpacity>
      </View>
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
              <View className="flex-row items-center bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2.5 mt-5">
                <Feather name="clock" size={18} color="#4f46e5" className="mr-2" />
                <Text className="text-indigo-900 font-bold text-sm">
                  Total Time Taken: <Text className="text-indigo-600">{timeTaken}</Text>
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
            className="bg-slate-900 py-4 rounded-2xl items-center mt-12 mb-6 shadow-sm active:opacity-90"
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
