import { useState, useCallback, useEffect } from "react";
import { GrammarQuestion } from "../types";

interface UseGrammarStateProps {
  questions: GrammarQuestion[];
  timeLimit?: number; // in minutes
}

export function useGrammarState({ questions }: UseGrammarStateProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAssessmentActive, setIsAssessmentActive] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Track time spent
  useEffect(() => {
    if (!isAssessmentActive || isSubmitted) return;

    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAssessmentActive, isSubmitted]);

  const selectAnswer = useCallback(
    (answer: string) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answer,
      }));
    },
    [currentQuestionIndex],
  );

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentQuestionIndex(index);
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
    answers,
    timeSpent,
    isAssessmentActive,
    isSubmitted,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    submitAssessment,
  };
}
