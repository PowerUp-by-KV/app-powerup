import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import {
  fetchListeningAssessments,
  fetchListeningAssessment,
  createListeningAttempt,
  submitListeningAttempt,
} from "@/services/listening-service";
import { ListeningAssessment, ListeningQuestion } from "@/services/listening-service";
import { setAssessmentResult } from "@/services/results-service";

export function ListeningScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<"loading" | "assessments" | "attempt" | "submission">(
    "loading",
  );
  const [assessments, setAssessments] = useState<ListeningAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<ListeningAssessment | null>(null);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data = await fetchListeningAssessments(true);
      console.debug("Listening assessments (active=true)", data);

      // fallback: if no active assessments, try without active filter
      if (data.length === 0) {
        console.warn("No active assessments found, trying unfiltered retrieval.");
        data = await fetchListeningAssessments();
        console.debug("Listening assessments (no filter)", data);
      }

      setAssessments(data);

      if (data.length > 0) {
        await handleSelectAssessment(data[0]);
      } else {
        setError(
          "No listening assessments available from API. Please seed /listening/assessments with is_active=true.",
        );
        setScreen("assessments");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to load assessments";
      // Check for timeout/network errors
      if (
        errorMsg.toLowerCase().includes("timeout") ||
        errorMsg.toLowerCase().includes("network") ||
        errorMsg.toLowerCase().includes("connection") ||
        err?.code === "ECONNABORTED" ||
        err?.code === "ENOTFOUND" ||
        err?.code === "ECONNREFUSED"
      ) {
        setError("Network timeout. Please check your connection and try again.");
      } else {
        setError(errorMsg);
      }
      setScreen("assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAssessment = async (assessment: ListeningAssessment | undefined) => {
    if (!assessment) return;
    try {
      // Clean up existing audio
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      setIsLoading(true);
      setError(null);
      const assessmentData = await fetchListeningAssessment(assessment.id);
      setSelectedAssessment(assessmentData);
      setQuestions(assessmentData.questions);
      setSelected({});
      setScreen("attempt");
      setAttemptId(null);

      // Kick off attempt creation in background to avoid UI block. It may still be pending at submit time.
      createListeningAttempt(assessmentData.id)
        .then((attempt) => {
          setAttemptId(attempt.id);
          setError(null);
        })
        .catch((err: any) => {
          console.warn("Listening attempt init failed", err);
          // Do not block user; they can still answer and submit.
          if (err?.response?.status !== 422) {
            const errorMsg =
              (err?.response?.data?.message as string) ||
              err.message ||
              "Unable to initialize attempt yet. Retry will occur on submit.";
            // Check for timeout/network errors
            if (
              errorMsg.toLowerCase().includes("timeout") ||
              errorMsg.toLowerCase().includes("network") ||
              errorMsg.toLowerCase().includes("connection") ||
              err?.code === "ECONNABORTED" ||
              err?.code === "ENOTFOUND" ||
              err?.code === "ECONNREFUSED"
            ) {
              setError("Network timeout. Please check your connection and try again.");
            } else {
              setError(errorMsg);
            }
          } else {
            setError(null);
          }
        });
    } catch (err: any) {
      console.error("Failed to load assessment:", err);
      const errorMsg = err.message || "Failed to load assessment";
      // Check for timeout/network errors
      if (
        errorMsg.toLowerCase().includes("timeout") ||
        errorMsg.toLowerCase().includes("network") ||
        errorMsg.toLowerCase().includes("connection") ||
        err?.code === "ECONNABORTED" ||
        err?.code === "ENOTFOUND" ||
        err?.code === "ECONNREFUSED"
      ) {
        setError("Network timeout. Please check your connection and try again.");
      } else {
        setError(errorMsg);
      }
      setScreen("assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async () => {
    if (!selectedAssessment?.audio_url) {
      setError("No audio available for this assessment");
      return;
    }

    try {
      setAudioLoading(true);
      setError(null);

      if (isPlaying && sound) {
        // Pause current audio
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        // Resume paused audio
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        // Load and play new audio
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: selectedAssessment.audio_url },
          { shouldPlay: true },
        );
        setSound(newSound);
        setIsPlaying(true);

        // Set up playback status update
        newSound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
      }
    } catch (err: any) {
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

  const allAnswered = Object.keys(selected).length === questions.length;

  const calculateScore = () => {
    const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const obtainedMarks = questions.reduce((sum, q) => {
      const userAnswer = selected[q.id!];
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
    if (!allAnswered) return;

    try {
      setIsLoading(true);
      setError(null);

      let currentAttemptId = attemptId;
      if (!currentAttemptId) {
        try {
          const attempt = await createListeningAttempt(selectedAssessment?.id || "");
          currentAttemptId = attempt.id;
          setAttemptId(attempt.id);
        } catch (createErr: any) {
          console.warn("createListeningAttempt failed", createErr);
          const score = calculateScore();
          setAssessmentResult({
            id: `${selectedAssessment?.id || "listening"}-${Date.now()}`,
            type: "listening",
            title: selectedAssessment?.title || "Listening Assessment",
            score: score.obtainedMarks,
            ...score,
          });
          setError(
            (createErr?.response?.data?.message as string) ||
              createErr.message ||
              "Could not create attempt; results saved locally.",
          );
          router.push("/write");
          return;
        }
      }

      const answers = Object.entries(selected).map(([questionId, selectedOptionId]) => ({
        question_id: questionId,
        selected_option_id: selectedOptionId,
      }));

      let response: any;
      if (!currentAttemptId) {
        throw new Error("Failed to create attempt");
      }
      try {
        response = await submitListeningAttempt(currentAttemptId, answers);
      } catch (submitErr: any) {
        console.warn("submitListeningAttempt failed", submitErr);
        const submitMsg =
          (submitErr?.response?.data?.message as string) ||
          submitErr.message ||
          "Failed to submit answers.";

        // If server times out, fallback to client-side grading (avoid dead-end) and continue.
        if (
          submitMsg.toLowerCase().includes("timeout") ||
          submitMsg.toLowerCase().includes("network") ||
          submitMsg.toLowerCase().includes("connection") ||
          submitMsg.toLowerCase().includes("aborted") ||
          submitErr?.code === "ECONNABORTED" ||
          submitErr?.code === "ENOTFOUND" ||
          submitErr?.code === "ECONNREFUSED" ||
          submitErr?.code === "ETIMEDOUT"
        ) {
          const score = calculateScore();
          setAssessmentResult({
            id: `${selectedAssessment?.id || "listening"}-${Date.now()}`,
            type: "listening",
            title: selectedAssessment?.title || "Listening Assessment",
            score: score.obtainedMarks,
            ...score,
          });
          setError(null);
          router.push("/write");
          return;
        }

        setError(submitMsg);
        return;
      }

      // Calculate marks based on correct answers
      let obtainedMarks = 0;
      let totalMarks = 0;

      if (response && response.correct_count !== undefined) {
        obtainedMarks = response.correct_count;
        totalMarks = questions.length;
      } else {
        // Fallback: calculate from questions
        questions.forEach((q) => {
          totalMarks += q.points || 1;
          const userAnswer = selected[q.id!];
          const correctOption = q.options.find((opt) => opt.is_correct);
          if (userAnswer === correctOption?.id) {
            obtainedMarks += q.points || 1;
          }
        });
      }

      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

      // Store result
      setAssessmentResult({
        id: `${selectedAssessment?.id || "listening"}-${Date.now()}`,
        type: "listening",
        title: selectedAssessment?.title || "Listening Assessment",
        totalMarks,
        obtainedMarks,
        percentage,
        isPassed: percentage >= 60,
        score: obtainedMarks,
      });

      // Navigate to writing assessment
      router.push("/write");
    } catch (err: any) {
      setError(err.message || "Failed to submit answers (timeout or network error). Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 p-[15px] bg-white">
      {screen === "loading" && (
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-3 text-base text-gray-600">Loading assessments...</Text>
        </View>
      )}

      {screen === "assessments" && (
        <>
          <Text className="text-2xl font-bold mb-4">Listening Assessments</Text>
          {error && (
            <View className="bg-red-100 p-3 rounded mb-3">
              <Text className="text-red-700 text-sm">{error}</Text>
              <TouchableOpacity className="bg-red-600 p-2 rounded mt-2" onPress={loadAssessments}>
                <Text className="text-white font-semibold text-center">Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          {assessments.length === 0 && !isLoading ? (
            <View className="flex-1 justify-center items-center p-8">
              <Text className="text-base text-gray-800 text-center mb-3">
                No listening assessments available right now.
              </Text>
              <TouchableOpacity className="bg-red-600 p-2 rounded mt-2" onPress={loadAssessments}>
                <Text className="text-white font-semibold text-center">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={assessments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item: ListeningAssessment }) => (
                <TouchableOpacity
                  className="p-4 border border-gray-300 rounded mb-3 bg-gray-100"
                  onPress={() => handleSelectAssessment(item)}
                >
                  <Text className="text-base font-semibold mb-1">{item.title}</Text>
                  <Text className="text-sm text-gray-700">{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      {screen === "attempt" && (
        <>
          <Text className="text-2xl font-bold mb-4">{selectedAssessment?.title}</Text>
          {error && (
            <View className="bg-red-100 p-3 rounded mb-3">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}
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
            {selectedAssessment?.audio_duration_seconds
              ? `Audio length: ${selectedAssessment.audio_duration_seconds}s`
              : "Tap Play to hear the audio passage."}
          </Text>

          <FlatList
            data={questions}
            keyExtractor={(item) => item.id || ""}
            renderItem={({ item, index }: { item: ListeningQuestion; index: number }) => (
              <View className="mb-[15px]">
                <Text className="text-base mb-2 font-semibold">
                  {index + 1}. {item.question_text}
                </Text>

                {item.options.map((option: any) => (
                  <TouchableOpacity
                    key={option.id || ""}
                    className={`border border-gray-300 rounded py-[10px] px-3 mb-2 ${
                      selected[item.id!] === option.id ? "border-indigo-600 bg-indigo-100" : ""
                    }`}
                    onPress={() => setAnswer(item.id!, option.id!)}
                  >
                    <Text
                      className={`${
                        selected[item.id!] === option.id
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
            className={`bg-indigo-600 py-3 px-4 items-center rounded-lg self-end mt-3 ${!allAnswered || isLoading ? "bg-gray-400" : ""}`}
            disabled={!allAnswered || isLoading}
            onPress={handleNext}
          >
            <Text className="text-white font-bold">{isLoading ? "Submitting..." : "Submit"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
