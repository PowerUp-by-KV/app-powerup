/**
 * src/features/interview/constants/mock-summary.ts
 *
 * Fallback summary shown when the API has not yet returned data.
 * Matches the InterviewSummary type exactly so it is a drop-in replacement.
 */

import type { InterviewSummary } from "../types/interview.types";

export const MOCK_SUMMARY: InterviewSummary = {
  sessionId: "sample",
  overallScore: 78,
  percentile: 72,
  categoryScores: [
    { category: "Technical", score: 80, trend: "up" },
    { category: "Communication", score: 72, trend: "stable" },
    { category: "Behavioral", score: 78, trend: "up" },
  ],
  strengths: ["Technical Knowledge", "Structured Responses"],
  focusAreas: ["Quantify your achievements", "Reduce filler words"],
  duration: 0,
  completedAt: new Date(0).toISOString(),
  questionCount: 0,
};
