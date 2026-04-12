/**
 * src/features/interview/hooks/useInterview.ts
 *
 * Central state manager for the standalone Interview Coach flow.
 *
 * Responsibilities:
 *  - Holds the full interview session state (questions, answers, scores, timing)
 *  - Exposes action helpers (startInterview, submitAnswer, resetInterview)
 *  - Calculates per-question scores with simple deterministic mock logic
 *  - Derives summary statistics for the SummaryScreen
 *
 * No external dependencies — pure React hooks + TypeScript.
 */

import { useCallback, useMemo, useReducer } from "react";
import type {
  InterviewAnswer,
  InterviewQuestion,
  InterviewSessionState,
  QuestionScore,
  SummaryStats,
} from "../types/interview.types";

// ── Static Question Banks ─────────────────────────────────────────────────────

/** Generic fallback question bank (used when no sessionType is selected). */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q1",
    text: "Tell me about yourself.",
    hint: "Cover your background, key skills, and what makes you a strong candidate.",
    category: "Personal",
    difficulty: "easy",
  },
  {
    id: "q2",
    text: "Describe a challenging project you worked on and how you handled it.",
    hint: "Use the STAR method: Situation, Task, Action, Result.",
    category: "Behavioral",
    difficulty: "medium",
  },
  {
    id: "q3",
    text: "What are your greatest strengths and weaknesses?",
    hint: "Be honest and specific. For weaknesses, mention how you are actively improving.",
    category: "Self-Awareness",
    difficulty: "medium",
  },
  {
    id: "q4",
    text: "Where do you see yourself in 5 years?",
    hint: "Align your goals with the role. Show ambition and commitment.",
    category: "Career Goals",
    difficulty: "easy",
  },
  {
    id: "q5",
    text: "Why do you want to work at this company?",
    hint: "Research the company values, mission, and recent work. Be specific.",
    category: "Motivation",
    difficulty: "easy",
  },
];

/** Introduction-focused question bank. */
const INTRODUCTION_QUESTIONS: InterviewQuestion[] = [
  {
    id: "intro_q1",
    text: "Tell me about yourself.",
    hint: "Give a brief 60-second pitch: background, key skills, and why you're here.",
    category: "Introduction",
    difficulty: "easy",
  },
  {
    id: "intro_q2",
    text: "Walk me through your background and how it led you to this role.",
    hint: "Connect your academic or work journey to the position you are applying for.",
    category: "Introduction",
    difficulty: "easy",
  },
  {
    id: "intro_q3",
    text: "What are your greatest strengths and how do they apply to this position?",
    hint: "Pick 2-3 strengths and tie each one to a concrete example relevant to the role.",
    category: "Introduction",
    difficulty: "medium",
  },
  {
    id: "intro_q4",
    text: "What motivates you professionally?",
    hint: "Be authentic — align your motivation with the company's mission or the role's impact.",
    category: "Introduction",
    difficulty: "easy",
  },
  {
    id: "intro_q5",
    text: "How would your friends or colleagues describe you?",
    hint: "Give real traits backed by a brief example. Avoid generic adjectives alone.",
    category: "Introduction",
    difficulty: "easy",
  },
];

/** Project-focused question bank. */
const PROJECT_QUESTIONS: InterviewQuestion[] = [
  {
    id: "proj_q1",
    text: "Describe a project you are most proud of. What was your role and what did you achieve?",
    hint: "Use the STAR method. Highlight your individual contribution and measurable outcome.",
    category: "Projects",
    difficulty: "medium",
  },
  {
    id: "proj_q2",
    text: "Tell me about a technically challenging project you worked on. How did you overcome the obstacles?",
    hint: "Focus on the technical complexity, your problem-solving process, and the resolution.",
    category: "Projects",
    difficulty: "hard",
  },
  {
    id: "proj_q3",
    text: "Describe a project where you had to collaborate with others. How did you handle disagreements?",
    hint: "Show communication and teamwork skills. Give a real example of conflict resolution.",
    category: "Projects",
    difficulty: "medium",
  },
  {
    id: "proj_q4",
    text: "Walk me through a project that did not go as planned. What did you learn?",
    hint: "Be honest about the failure, own your part, and emphasize the lesson and improvement.",
    category: "Projects",
    difficulty: "medium",
  },
  {
    id: "proj_q5",
    text: "How do you manage scope, timeline, and quality when working on a project?",
    hint: "Mention any tools or frameworks you use (Agile, Kanban, etc.) and give a real example.",
    category: "Projects",
    difficulty: "medium",
  },
];

/** Experience-focused question bank. */
const EXPERIENCE_QUESTIONS: InterviewQuestion[] = [
  {
    id: "exp_q1",
    text: "Tell me about your most recent work experience or internship.",
    hint: "Briefly describe the company, your role, key responsibilities, and one major achievement.",
    category: "Experience",
    difficulty: "easy",
  },
  {
    id: "exp_q2",
    text: "Describe a time you took initiative at work without being asked.",
    hint: "Use STAR. Show ownership and drive — focus on the outcome and impact.",
    category: "Experience",
    difficulty: "medium",
  },
  {
    id: "exp_q3",
    text: "Tell me about a time you had to learn a new skill quickly on the job.",
    hint: "Highlight your learning agility. Explain your approach and how fast you ramped up.",
    category: "Experience",
    difficulty: "medium",
  },
  {
    id: "exp_q4",
    text: "Describe a situation where you had to meet a tight deadline. How did you prioritize?",
    hint: "Show time management skills. Explain what you cut, delegated, or accelerated.",
    category: "Experience",
    difficulty: "medium",
  },
  {
    id: "exp_q5",
    text: "What is the most valuable lesson you have learned from your work experience so far?",
    hint: "Be genuine and reflective. Connect the lesson to how it shapes your work approach today.",
    category: "Experience",
    difficulty: "easy",
  },
];

/**
 * Map of session type → question bank.
 * Keys match the `title` values in the SessionPickerScreen session list.
 */
const SESSION_QUESTIONS: Record<string, InterviewQuestion[]> = {
  Introduction: INTRODUCTION_QUESTIONS,
  Projects: PROJECT_QUESTIONS,
  Experience: EXPERIENCE_QUESTIONS,
};

/**
 * Returns the question bank for a given session type.
 * Falls back to the generic INTERVIEW_QUESTIONS if the session type is unknown.
 */
export function getQuestionsForSession(sessionType?: string | null): InterviewQuestion[] {
  if (!sessionType) return INTERVIEW_QUESTIONS;
  return SESSION_QUESTIONS[sessionType] ?? INTERVIEW_QUESTIONS;
}

// ── Scoring Logic ─────────────────────────────────────────────────────────────

const FEEDBACK_BY_SCORE: Record<string, string> = {
  "9-10": "Outstanding answer — clear, structured, and highly relevant.",
  "7-8": "Strong answer with good depth. A bit more specificity would make it excellent.",
  "5-6": "Solid attempt. Try to expand on key points and use concrete examples.",
  "3-4": "Some good ideas, but the answer needs more structure and detail.",
  "0-2": "Very brief response. Aim for at least 2–3 sentences with specific examples.",
};

function getFeedbackForScore(score: number): string {
  if (score >= 9) return FEEDBACK_BY_SCORE["9-10"]!;
  if (score >= 7) return FEEDBACK_BY_SCORE["7-8"]!;
  if (score >= 5) return FEEDBACK_BY_SCORE["5-6"]!;
  if (score >= 3) return FEEDBACK_BY_SCORE["3-4"]!;
  return FEEDBACK_BY_SCORE["0-2"]!;
}

/**
 * Deterministic mock scoring based on answer text length and keyword richness.
 * No randomness — same input always produces the same score.
 */
function calculateScore(answer: string, _questionId: string): number {
  const trimmed = answer.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  // Quality keywords that suggest a structured, thoughtful answer
  const qualityKeywords = [
    "because",
    "therefore",
    "result",
    "achieved",
    "learned",
    "improved",
    "challenge",
    "solution",
    "team",
    "led",
    "managed",
    "example",
    "specifically",
    "situation",
    "action",
    "outcome",
    "impact",
    "responsibility",
  ];

  const lowerAnswer = trimmed.toLowerCase();
  const keywordMatches = qualityKeywords.filter((kw) => lowerAnswer.includes(kw)).length;

  // Base score from word count (caps at 6 pts)
  let score = 0;
  if (wordCount >= 10) score += 2;
  if (wordCount >= 30) score += 2;
  if (wordCount >= 60) score += 1;
  if (wordCount >= 100) score += 1;

  // Bonus from quality keywords (caps at 4 pts)
  score += Math.min(keywordMatches, 4);

  return Math.min(10, Math.max(0, score));
}

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: "START" }
  | {
      type: "SUBMIT_ANSWER";
      payload: { text: string; durationSeconds: number };
    }
  | { type: "RESET" };

function buildInitialState(): InterviewSessionState {
  return {
    id: `session-${Date.now()}`,
    startTimeMs: 0,
    endTimeMs: null,
    questions: INTERVIEW_QUESTIONS,
    answers: [],
    scores: [],
    currentQuestionIndex: 0,
    status: "idle",
  };
}

function interviewReducer(state: InterviewSessionState, action: Action): InterviewSessionState {
  switch (action.type) {
    case "START": {
      return {
        ...state,
        id: `session-${Date.now()}`,
        startTimeMs: Date.now(),
        endTimeMs: null,
        answers: [],
        scores: [],
        currentQuestionIndex: 0,
        status: "in-progress",
      };
    }

    case "SUBMIT_ANSWER": {
      // Guard: ignore duplicate dispatches after the interview is already done.
      // Without this, a double-tap on the last question would create
      // a duplicate answer/score entry because currentQ is still valid
      // (the index doesn't advance past the last question).
      if (state.status === "completed") return state;

      const currentQ = state.questions[state.currentQuestionIndex];
      if (!currentQ) return state;

      const answer: InterviewAnswer = {
        questionId: currentQ.id,
        text: action.payload.text,
        submittedAt: Date.now(),
        durationSeconds: action.payload.durationSeconds,
      };

      const score: QuestionScore = {
        questionId: currentQ.id,
        score: calculateScore(action.payload.text, currentQ.id),
        maxScore: 10,
        feedback: getFeedbackForScore(calculateScore(action.payload.text, currentQ.id)),
      };

      const newAnswers = [...state.answers, answer];
      const newScores = [...state.scores, score];
      const isLast = state.currentQuestionIndex === state.questions.length - 1;
      const nextIndex = isLast ? state.currentQuestionIndex : state.currentQuestionIndex + 1;

      return {
        ...state,
        answers: newAnswers,
        scores: newScores,
        currentQuestionIndex: nextIndex,
        status: isLast ? "completed" : "in-progress",
        endTimeMs: isLast ? Date.now() : null,
      };
    }

    case "RESET": {
      return buildInitialState();
    }

    default:
      return state;
  }
}

// ── Hook Return Type ──────────────────────────────────────────────────────────

export interface UseInterviewReturn {
  /** Full session state */
  session: InterviewSessionState;
  /** Current question object (null if not in progress) */
  currentQuestion: InterviewQuestion | null;
  /** True when there are no more questions after this one */
  isLastQuestion: boolean;
  /** 1-based progress label, e.g. "2 / 5" */
  progressLabel: string;
  /** Derived summary stats (only meaningful when status === 'completed') */
  summaryStats: SummaryStats;
  /** Start a fresh interview */
  startInterview: () => void;
  /** Submit the current answer and advance (or complete) */
  submitAnswer: (text: string, durationSeconds: number) => void;
  /** Reset back to idle state */
  resetInterview: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useInterview(): UseInterviewReturn {
  const [session, dispatch] = useReducer(interviewReducer, undefined, buildInitialState);

  // ── Derived values ──────────────────────────────────────────────────────────

  const currentQuestion = useMemo<InterviewQuestion | null>(
    () =>
      session.status === "in-progress"
        ? (session.questions[session.currentQuestionIndex] ?? null)
        : null,
    [session.status, session.questions, session.currentQuestionIndex],
  );

  const isLastQuestion = useMemo(
    () => session.currentQuestionIndex === session.questions.length - 1,
    [session.currentQuestionIndex, session.questions.length],
  );

  const progressLabel = useMemo(
    () => `${session.currentQuestionIndex + 1} / ${session.questions.length}`,
    [session.currentQuestionIndex, session.questions.length],
  );

  const summaryStats = useMemo<SummaryStats>(() => {
    const totalScore = session.scores.reduce((sum, s) => sum + s.score, 0);
    const maxPossibleScore = session.questions.length * 10;
    const averageScore =
      session.scores.length > 0 ? Math.round((totalScore / session.scores.length) * 10) / 10 : 0;

    const durationSeconds =
      session.endTimeMs && session.startTimeMs
        ? Math.round((session.endTimeMs - session.startTimeMs) / 1000)
        : 0;

    let performanceLabel: SummaryStats["performanceLabel"] = "Needs Improvement";
    if (averageScore >= 8) performanceLabel = "Excellent";
    else if (averageScore >= 5) performanceLabel = "Good";

    return {
      totalQuestions: session.questions.length,
      answeredQuestions: session.answers.length,
      totalScore,
      maxPossibleScore,
      averageScore,
      durationSeconds,
      performanceLabel,
    };
  }, [session.scores, session.answers, session.questions, session.startTimeMs, session.endTimeMs]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const startInterview = useCallback(() => {
    dispatch({ type: "START" });
  }, []);

  const submitAnswer = useCallback((text: string, durationSeconds: number) => {
    dispatch({ type: "SUBMIT_ANSWER", payload: { text, durationSeconds } });
  }, []);

  const resetInterview = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    session,
    currentQuestion,
    isLastQuestion,
    progressLabel,
    summaryStats,
    startInterview,
    submitAnswer,
    resetInterview,
  };
}
