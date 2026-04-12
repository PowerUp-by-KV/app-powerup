/**
 * src/features/interview/context/InterviewContext.tsx
 *
 * Provides interview session state to all screens in the
 * /app/interview/coach/ route group via React Context.
 *
 * Usage:
 *   // In _layout.tsx (route group)
 *   <InterviewProvider><Stack /></InterviewProvider>
 *
 *   // In any child screen
 *   const interview = useInterviewContext();
 */

import React, { createContext, useContext } from "react";
import { useInterview, type UseInterviewReturn } from "../hooks/useInterview";

// ── Context ───────────────────────────────────────────────────────────────────

const InterviewContext = createContext<UseInterviewReturn | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface InterviewProviderProps {
  children: React.ReactNode;
}

export function InterviewProvider({ children }: InterviewProviderProps) {
  const interview = useInterview();
  return (
    <InterviewContext.Provider value={interview}>
      {children}
    </InterviewContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

export function useInterviewContext(): UseInterviewReturn {
  const ctx = useContext(InterviewContext);
  if (!ctx) {
    throw new Error(
      "useInterviewContext must be used inside <InterviewProvider>. " +
        "Wrap the interview coach route group with InterviewProvider.",
    );
  }
  return ctx;
}
