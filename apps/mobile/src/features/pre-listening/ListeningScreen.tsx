import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useGetAssessmentSectionQuery,
  useSubmitAssessmentSectionMutation,
  useCompleteSessionMutation,
  getNextRouteForSection,
} from "@/services/assessment-api";
import { AudioPlayer } from "./components/AudioPlayer";
import { RecordingButton } from "./components/RecordingButton";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { AssessmentHeader } from "@/features/pre-assessment";

interface ListeningScreenProps {
  sessionId?: string;
}

interface FlatQuestion {
  id: string;
  question_no: number;
  question: string;
  options: { label: string; value: string }[];
  audio_url: string | null | undefined;
  story_no: number;
}

export function ListeningScreen({ sessionId: propSessionId }: ListeningScreenProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | undefined>(propSessionId);

  useEffect(() => {
    if (!sessionId) {
      getAssessmentSessionId().then((id) => {
        if (id) setSessionId(id);
      });
    }
  }, [sessionId]);

  const { data: sectionData, isLoading } = useGetAssessmentSectionQuery(
    { session_id: sessionId!, section: "D_LISTEN_ANSWER" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();
  const [completeSession] = useCompleteSessionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());

  // D_LISTEN_ANSWER returns stories:[{audio_url, questions:[{id,question,options}]}]
  // Flatten to a single list while keeping audio_url per question
  const flatQuestions: FlatQuestion[] = (sectionData?.stories ?? []).flatMap((story: any) =>
    (story.questions ?? []).map((q: any) => ({
      id: String(q.id),
      question_no: q.question_no,
      question: q.question,
      options: q.options ?? [],
      audio_url: story.audio_url,
      story_no: story.audio_no,
    })),
  );

  const currentQuestion = flatQuestions[currentQuestionIndex];

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

  const isLastQuestion = currentQuestionIndex === flatQuestions.length - 1;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleFinish = async () => {
    try {
      const formattedAnswers = flatQuestions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] ?? "",
      }));

      const response = await submitSection({
        session_id: sessionId!,
        section: "D_LISTEN_ANSWER",
        data: { answers: formattedAnswers },
      }).unwrap();

      await saveCompletedSection("D_LISTEN_ANSWER");
      if (!response.next_section) {
        await completeSession({ session_id: sessionId! }).unwrap();
      }

      const nextRoute = getNextRouteForSection(response.next_section);
      router.push({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err) {
      Alert.alert("Error", "Could not submit answers.");
    }
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      Alert.alert("Answer required", "Please select an answer before continuing.");
      return;
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
    } else {
      router.back();
    }
  };

  const selectedAnswer = answers[currentQuestion.id];

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <AssessmentHeader
        section="D_LISTEN_ANSWER"
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={flatQuestions.length}
        startedAtMs={startedAt}
        onFinish={handleFinish}
        onSectionChange={(next) =>
          router.replace({
            pathname: getNextRouteForSection(next),
            params: { session_id: sessionId },
          })
        }
      />
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
          Audio {currentQuestion.story_no}
        </Text>
        <Text className="text-base font-semibold text-gray-800 mb-4">
          Question {currentQuestionIndex + 1} of {flatQuestions.length}
        </Text>

        {/* Play the story audio — shared per story group */}
        <AudioPlayer audioUrl={currentQuestion.audio_url} />

        {/* MCQ question */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <Text className="text-base font-medium text-gray-800">{currentQuestion.question}</Text>
        </View>

        {/* Options */}
        {currentQuestion.options.map((opt) => {
          const isSelected = selectedAnswer === opt.value || selectedAnswer === opt.label;
          return (
            <TouchableOpacity
              key={opt.label}
              className={`border rounded-lg p-4 mb-3 flex-row items-center ${
                isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white"
              }`}
              onPress={() => handleSelect(opt.value || opt.label)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                  isSelected ? "border-indigo-500" : "border-gray-300"
                }`}
              >
                {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
              </View>
              <Text
                className={`flex-1 text-sm ${isSelected ? "text-indigo-700 font-medium" : "text-gray-700"}`}
              >
                {opt.label}: {opt.value}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View className="flex-row justify-between mt-6 gap-3">
          <TouchableOpacity
            className="flex-1 bg-gray-500 py-3 rounded-lg items-center"
            onPress={handleBack}
            disabled={isSubmitting}
          >
            <Text className="text-white font-semibold">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${isSubmitting ? "bg-indigo-400" : "bg-indigo-600"}`}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">{isLastQuestion ? "Finish" : "Next"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
