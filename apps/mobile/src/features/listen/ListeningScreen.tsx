import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useRouter } from "expo-router";
import {
  ListeningAssessment,
  ListeningQuestion,
  useCreateListeningAttemptMutation,
  useGetListeningAssessmentQuery,
  useGetListeningAssessmentsQuery,
  useSubmitListeningAttemptMutation,
} from "@/services/listening-api";
import { setAssessmentResult } from "@/services/results-service";

// Conditionally import expo-av to avoid errors if module is not available
let Audio: typeof import("expo-av").Audio | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Audio = require("expo-av").Audio;
} catch {
  console.warn("expo-av not available, audio features will be disabled");
}

export function ListeningScreen() {
  const router = useRouter();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const {
    data: assessments,
    isError: isAssessmentsError,
    refetch: refetchAssessments,
  } = useGetListeningAssessmentsQuery(undefined);

  const { data: selectedAssessment, isError: isAssessmentError } = useGetListeningAssessmentQuery(
    selectedAssessmentId ?? skipToken,
  );

  const [createListeningAttempt] = useCreateListeningAttemptMutation();
  const [submitListeningAttempt] = useSubmitListeningAttemptMutation();

  useEffect(() => {
    if (assessments && assessments.length > 0 && !selectedAssessmentId) {
      setSelectedAssessmentId(assessments[0]!.id);
    }
  }, [assessments, selectedAssessmentId]);

  useEffect(() => {
    if (selectedAssessment) {
      setSelected({});
      setAttemptId(null);
      setError(null);
      createListeningAttempt(selectedAssessment.id)
        .unwrap()
        .then((attempt) => {
          setAttemptId(attempt.id);
        })
        .catch((err) => {
          console.warn("Listening attempt init failed", err);
        });
    }
  }, [selectedAssessment, createListeningAttempt]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setError(null);
  };

  const playAudio = async () => {
    if (!Audio) {
      setError("Audio playback is not available on this device");
      return;
    }

    if (!selectedAssessment?.audio_url) {
      setError("No audio available for this assessment");
      return;
    }

    try {
      setAudioLoading(true);
      setError(null);

      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: selectedAssessment.audio_url },
          { shouldPlay: true },
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status: any) => {
          // eslint-disable-line @typescript-eslint/no-explicit-any
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
      }
    } catch (err) {
      console.error("Audio playback error:", err);
      setError("Failed to load audio. Please check your connection and try again.");
      setIsPlaying(false);
    } finally {
      setAudioLoading(false);
    }
  };

  const setAnswer = (id: string, optionId: string) => {
    setSelected((prev) => ({ ...prev, [id]: optionId }));
  };

  const allAnswered = selectedAssessment
    ? Object.keys(selected).length === selectedAssessment.questions.length
    : false;

  const calculateScore = () => {
    const questions = selectedAssessment?.questions || [];
    const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const obtainedMarks = questions.reduce((sum, q) => {
      const userAnswer = selected[q.id];
      const correctOption = q.options.find((opt) => opt.is_correct);
      return sum + (userAnswer === correctOption?.id ? q.points || 1 : 0);
    }, 0);
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    return {
      totalMarks,
      obtainedMarks,
      percentage,
      isPassed: percentage >= 60,
    };
  };

  const handleNext = async () => {
    if (!allAnswered || !selectedAssessment) return;

    setIsLoading(true);
    setError(null);

    let currentAttemptId = attemptId;
    if (!currentAttemptId) {
      try {
        const attempt = await createListeningAttempt(selectedAssessment.id).unwrap();
        currentAttemptId = attempt.id;
        setAttemptId(attempt.id);
      } catch (createErr) {
        console.warn("createListeningAttempt failed", createErr);
        const score = calculateScore();
        setAssessmentResult({
          id: `${selectedAssessment.id}-${Date.now()}`,
          type: "listening",
          title: selectedAssessment.title,
          score: score.obtainedMarks,
          ...score,
        });
        setError(
          (createErr as { data?: { message?: string } })?.data?.message ||
            (createErr as { message?: string })?.message ||
            "Could not create attempt; results saved locally.",
        );
        router.push("/write");
        setIsLoading(false);
        return;
      }
    }

    const answers = Object.entries(selected).map(([questionId, selectedOptionId]) => ({
      question_id: questionId,
      selected_option_id: selectedOptionId,
    }));

    try {
      const response = await submitListeningAttempt({
        attempt_id: currentAttemptId,
        answers,
      }).unwrap();
      let obtainedMarks = response.score;
      let totalMarks = selectedAssessment.questions.length;
      const percentage = response.percentage;
      const isPassed = response.is_passed;
      setAssessmentResult({
        id: `${selectedAssessment.id}-${Date.now()}`,
        type: "listening",
        title: selectedAssessment.title,
        totalMarks,
        obtainedMarks,
        percentage,
        isPassed,
        score: obtainedMarks,
      });
      router.push("/write");
    } catch (submitErr) {
      const submitMsg =
        (submitErr as { data?: { message?: string } })?.data?.message ||
        (submitErr as { message?: string })?.message ||
        "Failed to submit answers.";
      if (
        typeof submitMsg === "string" &&
        (submitMsg.toLowerCase().includes("timeout") ||
          submitMsg.toLowerCase().includes("network") ||
          submitMsg.toLowerCase().includes("connection") ||
          (submitErr as { code?: string })?.code === "ECONNABORTED" ||
          (submitErr as { code?: string })?.code === "ENOTFOUND" ||
          (submitErr as { code?: string })?.code === "ECONNREFUSED" ||
          (submitErr as { code?: string })?.code === "ETIMEDOUT")
      ) {
        const score = calculateScore();
        setAssessmentResult({
          id: `${selectedAssessment.id}-${Date.now()}`,
          type: "listening",
          title: selectedAssessment.title,
          score: score.obtainedMarks,
          ...score,
        });
        router.push("/write");
      } else {
        setError(String(submitMsg));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAssessmentsError || isAssessmentError) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <Text className="text-red-700 text-lg font-bold mb-3">
          Unable to load listening content
        </Text>
        <TouchableOpacity className="bg-indigo-600 px-4 py-3 rounded" onPress={refetchAssessments}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-[15px] bg-white">
      {isLoading && !selectedAssessment && (
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-3 text-base text-gray-600">Loading assessments...</Text>
        </View>
      )}

      {!isLoading && (
        <>
          <Text className="text-2xl font-bold mb-4">Listening Assessments</Text>

          {error && (
            <View className="bg-red-100 p-3 rounded mb-3">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          <FlatList
            data={assessments || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: ListeningAssessment }) => (
              <TouchableOpacity
                className={`p-4 border rounded mb-3 ${
                  item.id === selectedAssessmentId
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 bg-gray-100"
                }`}
                onPress={() => handleSelectAssessment(item.id)}
              >
                <Text className="text-base font-semibold mb-1">{item.title}</Text>
                <Text className="text-sm text-gray-700">{item.description}</Text>
              </TouchableOpacity>
            )}
          />

          {selectedAssessment && (
            <>
              <Text className="text-2xl font-bold mb-4">{selectedAssessment.title}</Text>
              <TouchableOpacity
                className={`bg-indigo-600 py-[10px] px-4 rounded-lg self-start mb-3 ${audioLoading ? "bg-gray-400" : ""}`}
                onPress={playAudio}
                disabled={audioLoading}
              >
                <Text className="text-white font-bold">
                  {audioLoading ? "Loading..." : isPlaying ? "Pause Audio" : "Play Audio"}
                </Text>
              </TouchableOpacity>
              <Text className="mb-4 text-gray-700 text-sm">
                Tap Play to hear the audio passage.
              </Text>

              <FlatList
                data={selectedAssessment.questions}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }: { item: ListeningQuestion; index: number }) => (
                  <View className="mb-[15px]">
                    <Text className="text-base mb-2 font-semibold">
                      {index + 1}. {item.question_text}
                    </Text>
                    {item.options.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        className={`border border-gray-300 rounded py-[10px] px-3 mb-2 ${
                          selected[item.id] === option.id ? "border-indigo-600 bg-indigo-100" : ""
                        }`}
                        onPress={() => setAnswer(item.id, option.id)}
                      >
                        <Text
                          className={`${
                            selected[item.id] === option.id
                              ? "text-indigo-600 font-bold"
                              : "text-gray-800"
                          }`}
                        >
                          {option.option_text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />

              <TouchableOpacity
                className={`bg-indigo-600 py-3 px-4 items-center rounded-lg self-end mt-3 ${
                  !allAnswered || isLoading ? "bg-gray-400" : ""
                }`}
                disabled={!allAnswered || isLoading}
                onPress={handleNext}
              >
                <Text className="text-white font-bold">
                  {isLoading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
}
