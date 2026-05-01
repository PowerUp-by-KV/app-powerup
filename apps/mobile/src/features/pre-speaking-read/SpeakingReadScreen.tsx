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
  getNextRouteForSection,
} from "@/services/assessment-api";
import { SentenceDisplay } from "./components/SentenceDisplay";
import { Recorder } from "./components/Recorder";
import type { SpeakingReadQuestion } from "./types";

interface SpeakingReadScreenProps {
  sessionId?: string;
}

export function SpeakingReadScreen({ sessionId }: SpeakingReadScreenProps) {
  const router = useRouter();

  const { data: sectionData, isLoading } = useGetAssessmentSectionQuery(
    { session_id: sessionId!, section: "A_SPEAKING" },
    { skip: !sessionId },
  );

  const [submitSection, { isLoading: isSubmitting }] = useSubmitAssessmentSectionMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Dummy recording state since useSpeakingReadState is not adapted to API yet
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => {
    setIsRecording(false);
    if (currentQuestion) {
      // use `id` if available, otherwise fall back to questionNo
      const key =
        (currentQuestion as any).id ??
        String(currentQuestion.questionNo ?? currentQuestion.questionNo);
      setAnswers((prev) => ({ ...prev, [key]: "recorded_audio.m4a" }));
    }
  };

  if (isLoading || !sectionData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // API may return either `questions` or `sentences` depending on section.
  const rawItems: any[] = (sectionData as any).questions || (sectionData as any).sentences || [];

  const questions: SpeakingReadQuestion[] = rawItems.map((it) => {
    // If the API already uses our shape, return as-is
    if (it.sentence && it.recordingTime !== undefined) {
      return it as SpeakingReadQuestion;
    }

    // Map API fields to our local type
    return {
      section: (sectionData as any).section || "A_SPEAKING",
      subSection: (it.sub_section as string) || "",
      questionNo: (it.question_no ?? it.questionNo ?? 0) as number,
      sentence: it.text ?? it.question ?? "",
      noOfLines: Number(it.no_of_lines ?? it.noOfLines ?? 1),
      complexity: (typeof it.complexity === "string"
        ? it.complexity.charAt(0).toUpperCase() + it.complexity.slice(1).toLowerCase()
        : "Medium") as "Easy" | "Medium" | "Advanced",
      answerType: "Record Voice",
      recordingTime: Number(it.recording_time_seconds ?? it.recordingTime ?? 30),
    };
  });

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>No questions found for this section.</Text>
      </View>
    );
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleFinish = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        audio_url: val,
      }));

      const response = await submitSection({
        session_id: sessionId!,
        section: "A_SPEAKING",
        data: { answers: formattedAnswers },
      }).unwrap();

      const nextRoute = getNextRouteForSection(response.next_section);
      router.push({ pathname: nextRoute, params: { session_id: sessionId } });
    } catch (err) {
      Alert.alert("Error", "Could not submit answers.");
    }
  };

  const handleNext = () => {
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4">
        <SentenceDisplay
          question={currentQuestion as any}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />

        <Recorder
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          maxDuration={30}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />

        <View className="flex-row justify-between mt-8 gap-3">
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
              <Text className="text-white font-semibold">{isLastQuestion ? "Submit" : "Next"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
