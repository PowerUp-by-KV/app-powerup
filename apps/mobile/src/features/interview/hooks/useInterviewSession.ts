/**
 * src/features/interview/hooks/useInterviewSession.ts
 *
 * Manages interview session state: session ID generation, question navigation,
 * progress tracking, and session reset.
 *
 * Responsibilities:
 *  - Generate and persist a unique sessionId per interview run
 *  - Track current question index and total question count
 *  - Expose navigation helpers (next, previous, jump)
 *  - Provide progress as a 0–1 fraction
 *  - Allow resetting the session (e.g., "Start over")
 *
 * This hook is stateful but side-effect-free — it does not call any API.
 * Pair it with interviewFeedbackApi.ts for network calls.
 */

import { useState, useCallback, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InterviewSessionState {
  /** Stable unique ID for this session run (UUID v4). */
  sessionId: string;
  /** 0-based index of the currently active question. */
  currentIndex: number;
  /** Total number of questions in the session. */
  totalQuestions: number;
  /** Completion fraction [0, 1]. Reaches exactly 1 once completeSession() is called. */
  progress: number;
  /** Whether the last question has been answered. */
  isComplete: boolean;
}

export interface UseInterviewSessionReturn extends InterviewSessionState {
  /** Advance to the next question. No-op if already at the last. */
  nextQuestion: () => void;
  /** Go back to the previous question. No-op if at the first. */
  previousQuestion: () => void;
  /** Jump directly to a specific 0-based question index. */
  goToQuestion: (index: number) => void;
  /** Mark the session complete (e.g., after final submission). */
  completeSession: () => void;
  /** Reset to the first question with a fresh session ID. */
  resetSession: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generates a RFC-4122 v4 UUID without external dependencies. */
function generateSessionId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseInterviewSessionOptions {
  /** Number of questions in the session. Must be >= 1. */
  totalQuestions: number;
  /** Optional starting index (0-based). Defaults to 0. */
  initialIndex?: number;
}

export function useInterviewSession({
  totalQuestions,
  initialIndex = 0,
}: UseInterviewSessionOptions): UseInterviewSessionReturn {
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId());

  // Use lazy initializer so the clamp runs once on mount, not on every render.
  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    Math.max(0, Math.min(initialIndex, totalQuestions - 1)),
  );

  const [isComplete, setIsComplete] = useState<boolean>(false);

  // ── Derived state ──────────────────────────────────────────────────────────

  const progress = useMemo<number>(() => {
    // Once the session is explicitly completed, report 100 % regardless of
    // currentIndex. Without this, progress would max out at (n-1)/n because
    // currentIndex is clamped to totalQuestions - 1.
    if (isComplete) return 1;
    return totalQuestions > 0 ? currentIndex / totalQuestions : 0;
  }, [currentIndex, totalQuestions, isComplete]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const nextQuestion = useCallback((): void => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next < totalQuestions ? next : prev;
    });
  }, [totalQuestions]);

  const previousQuestion = useCallback((): void => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToQuestion = useCallback(
    (index: number): void => {
      // Guard against NaN / Infinity — Math.min/max propagate NaN silently,
      // which would corrupt currentIndex and break every downstream comparison.
      if (!Number.isFinite(index)) return;
      const clamped = Math.max(0, Math.min(index, totalQuestions - 1));
      setCurrentIndex(clamped);
    },
    [totalQuestions],
  );

  const completeSession = useCallback((): void => {
    setIsComplete(true);
  }, []);

  const resetSession = useCallback((): void => {
    setSessionId(generateSessionId());
    setCurrentIndex(0);
    setIsComplete(false);
  }, []);

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    sessionId,
    currentIndex,
    totalQuestions,
    progress,
    isComplete,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    completeSession,
    resetSession,
  };
}
