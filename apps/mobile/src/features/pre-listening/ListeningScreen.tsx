import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import {
  getNextRouteForSection,
  type ListeningStory,
  useCompleteSessionMutation,
  useGetAssessmentSectionQuery,
  useLazyGetAssessmentStatusQuery,
  useSubmitAssessmentSectionMutation,
} from "@/services/assessment-api";
import { getAssessmentSessionId, saveCompletedSection } from "@/services/auth-storage";
import { AssessmentHeader } from "@/features/pre-assessment";

import { AudioPlayer } from "./components/AudioPlayer";

interface ListeningScreenProps {
  sessionId?: string;
}

function optionKey(option: { label?: string; value?: string }, index: number) {
  return option.label ?? String.fromCharCode(65 + index);
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
  const [getAssessmentStatus] = useLazyGetAssessmentStatusQuery();

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [scoringMessage, setScoringMessage] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const stories = sectionData?.stories ?? [];
  const currentStory = stories[currentStoryIndex];
  const totalQuestions = stories.reduce((sum, story) => sum + story.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const isLastStory = currentStoryIndex === stories.length - 1;

  const pollUntilScoringComplete = async () => {
    if (!sessionId) return;

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const status = await getAssessmentStatus({ session_id: sessionId }).unwrap();
      if (status.pending_answers === 0) return;
      setScoringMessage(
        `Scoring your speaking answers (${status.completed_answers}/${status.total_answers} done)...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Assessment scoring is still pending.");
  };

  const finishAssessment = async () => {
    if (!sessionId) return;
    if (answeredCount < totalQuestions) {
      Alert.alert("Complete all questions", "Please answer every listening question first.");
      return;
    }

    setIsCompleting(true);
    setScoringMessage(null);
    try {
      const formattedAnswers = stories.flatMap((story) =>
        story.questions.map((question) => ({
          question_id: question.id,
          answer: answers[String(question.id)],
        })),
      );

      const response = await submitSection({
        session_id: sessionId,
        section: "D_LISTEN_ANSWER",
        data: { answers: formattedAnswers },
      }).unwrap();

      await saveCompletedSection("D_LISTEN_ANSWER");

      if (!response.next_section) {
        const completion = await completeSession({ session_id: sessionId }).unwrap();
        if ("pending_answers" in completion && completion.pending_answers > 0) {
          setScoringMessage("Scoring your speaking answers...");
          await pollUntilScoringComplete();
          await completeSession({ session_id: sessionId }).unwrap();
        }
      }

      router.push({
        pathname: getNextRouteForSection(response.next_section),
        params: { session_id: sessionId },
      });
    } catch (err) {
      console.error("Listening assessment submit failed", err);
      Alert.alert(
        "Assessment still processing",
        "Could not finish the assessment yet. Please try again in a moment.",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNext = async () => {
    if (!currentStory) return;
    const missingForStory = currentStory.questions.some((q) => !answers[String(q.id)]);
    if (missingForStory) {
      Alert.alert(
        "Answer required",
        "Please answer all questions for this audio before moving on.",
      );
      return;
    }

    if (isLastStory) {
      await finishAssessment();
      return;
    }
    setCurrentStoryIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      return;
    }
    router.back();
  };

  if (isLoading || !sectionData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!currentStory) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>No listening stories found for this section.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <AssessmentHeader
        section="D_LISTEN_ANSWER"
        currentQuestionIndex={answeredCount}
        totalQuestions={totalQuestions}
        startedAtMs={startedAt}
        onFinish={finishAssessment}
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
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-5">
          <Text className="text-lg font-bold text-gray-800">
            Audio {currentStoryIndex + 1} of {stories.length}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Listen to the story, then answer the questions below.
          </Text>
        </View>

        <AudioPlayer
          audioUrl={currentStory.audio_url}
          audioText={currentStory.script || "Listen carefully before answering."}
          duration={60}
        />

        <View className="gap-5">
          {currentStory.questions.map((question, questionIndex) => (
            <View key={question.id} className="bg-gray-50 p-4 rounded-xl">
              <Text className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Question {questionIndex + 1}
              </Text>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                {question.question}
              </Text>
              <View className="gap-2">
                {(question.options ?? []).map((option, index) => {
                  const key = optionKey(option, index);
                  const selected = answers[String(question.id)] === key;
                  return (
                    <TouchableOpacity
                      key={`${question.id}-${key}`}
                      className={`p-3 rounded-lg border ${
                        selected ? "bg-indigo-50 border-indigo-500" : "bg-white border-gray-200"
                      }`}
                      onPress={() =>
                        setAnswers((prev) => ({ ...prev, [String(question.id)]: key }))
                      }
                    >
                      <Text
                        className={selected ? "text-indigo-700 font-semibold" : "text-gray-700"}
                      >
                        {key}. {option.value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {scoringMessage ? (
          <View className="bg-indigo-50 p-3 rounded-xl mt-5">
            <Text className="text-indigo-700 text-center">{scoringMessage}</Text>
          </View>
        ) : null}

        <View className="flex-row justify-between mt-8 gap-3">
          <TouchableOpacity
            className="flex-1 bg-gray-500 py-3 rounded-lg items-center"
            onPress={handleBack}
            disabled={isSubmitting || isCompleting}
          >
            <Text className="text-white font-semibold">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${
              isSubmitting || isCompleting ? "bg-indigo-400" : "bg-indigo-600"
            }`}
            onPress={handleNext}
            disabled={isSubmitting || isCompleting}
          >
            {isSubmitting || isCompleting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                {isLastStory ? "Finish" : "Next Audio"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
