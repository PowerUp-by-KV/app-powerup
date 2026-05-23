import { useState, useCallback, useEffect } from "react";
import { SpeakingReadQuestion } from "../types";

interface UseSpeakingReadStateProps {
  questions: SpeakingReadQuestion[];
}

export function useSpeakingReadState({ questions }: UseSpeakingReadStateProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAssessmentActive, setIsAssessmentActive] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Track recording duration
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingDuration(0);
  }, []);

  const stopRecording = useCallback(
    (recordingUrl: string) => {
      setIsRecording(false);
      setRecordings((prev) => ({
        ...prev,
        [currentQuestionIndex]: recordingUrl,
      }));
    },
    [currentQuestionIndex],
  );

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setRecordingDuration(0);
    }
  }, [currentQuestionIndex, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setRecordingDuration(0);
    }
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentQuestionIndex(index);
        setRecordingDuration(0);
      }
    },
    [questions.length],
  );

  const submitAssessment = useCallback(() => {
    setIsSubmitted(true);
    setIsAssessmentActive(false);
  }, []);

  return {
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    recordings,
    isRecording,
    recordingDuration,
    isAssessmentActive,
    isSubmitted,
    startRecording,
    stopRecording,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    submitAssessment,
  };
}
