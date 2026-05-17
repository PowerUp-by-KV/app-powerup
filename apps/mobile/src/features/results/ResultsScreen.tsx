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
import { useCompleteSessionMutation } from "@/services/assessment-api";
import { ScoreGauge } from "./components/ScoreGauge";
import { ScoreCard } from "./components/ScoreCard";
import { getAssessmentSessionId } from "@/services/auth-storage";

interface ResultsScreenProps {
  sessionId?: string;
}

export function ResultsScreen({ sessionId: propSessionId }: ResultsScreenProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | undefined>(propSessionId);

  useEffect(() => {
    if (!sessionId) {
      getAssessmentSessionId().then((id) => {
        if (id) setSessionId(id);
      });
    }
  }, [sessionId]);

  const [completeSession, { data: resultData, isLoading, error }] = useCompleteSessionMutation();
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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error || !resultData) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg text-slate-600 text-center mb-6">
          Could not load assessment results. Please try again later.
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
              score={(resultData.percentage || 0) / 16.66} // Normalize 100% to 6 points
              total={6}
              obtainedPoints={resultData.total_score || 0}
              totalPoints={resultData.max_score || 100}
              cefr={resultData.cefr_range || "N/A"}
            />
          </View>

          <View className="flex-row flex-wrap justify-between mt-6">
            {resultData.section_scores &&
              Object.entries(resultData.section_scores).map(([key, score]) => (
                <ScoreCard
                  key={key}
                  title={key.replace(/_/g, " ")}
                  score={score}
                  total={100}
                  icon="activity"
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
