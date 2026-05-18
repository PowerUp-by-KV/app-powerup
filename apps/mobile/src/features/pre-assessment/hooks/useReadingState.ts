import { useState, useCallback, useRef, useEffect } from "react";
import type { ReadingQuestion } from "../types";

interface UseReadingStateProps {
  questions: ReadingQuestion[];
}

export function useReadingState({ questions }: UseReadingStateProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const currentQuestionIndexRef = useRef(currentQuestionIndex);

  // Keep the ref in sync with state
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];

  const selectAnswer = useCallback((answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndexRef.current]: answer,
    }));
  }, []);

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev < questions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const calculateScore = useCallback(() => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  }, [answers, questions]);

  return {
    currentQuestion,
    currentQuestionIndex,
    answers,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    calculateScore,
  };
}
