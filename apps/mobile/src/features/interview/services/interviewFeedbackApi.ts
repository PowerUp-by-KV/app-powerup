/**
 * src/features/interview/services/interviewFeedbackApi.ts
 *
 * RTK Query slice for interview feedback, real-time indicators, and reports.
 * Provides endpoints for:
 *  - Live indicators (WebSocket + polling)
 *  - Question feedback
 *  - Interview summary
 *  - Full reports
 *  - PDF download and sharing
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FULL_API_BASE_URL, API_V1_URL, USE_MOCK_API, AUTH_HEADERS } from "@/constants/apiConfig";
import type {
  LiveIndicators,
  QuestionFeedback,
  InterviewSummary,
  Report,
  ShareOptions,
} from "../types/interview.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GetLiveIndicatorsArg {
  sessionId: string;
  questionId: string;
}

interface GetQuestionFeedbackArg {
  sessionId: string;
  questionId: string;
}

interface GetInterviewSummaryArg {
  sessionId: string;
}

interface GetFullReportArg {
  reportId: string;
}

interface DownloadReportPdfArg {
  reportId: string;
}

interface ShareResultsArg extends ShareOptions {
  reportId: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_LIVE_INDICATORS: LiveIndicators = {
  speakingPace: 142,
  clarity: 78,
  fillerCount: 3,
  confidence: 82,
  timestamp: Date.now(),
};

const MOCK_QUESTION_FEEDBACK: QuestionFeedback = {
  questionId: "q1",
  questionText: "Tell me about yourself and your background.",
  score: 76,
  breakdown: [
    { label: "Relevance", score: 80, weight: 0.25 },
    { label: "Structure", score: 72, weight: 0.25 },
    { label: "Clarity", score: 78, weight: 0.25 },
    { label: "Depth", score: 74, weight: 0.25 },
  ],
  starAnalysis: {
    situation: { present: true, quality: "good" },
    task: { present: true, quality: "good" },
    action: { present: true, quality: "excellent" },
    result: { present: false, quality: "weak" },
    overallScore: 72,
  },
  feedbackItems: [
    { id: "f1", type: "strength", icon: "check-circle", text: "Clear and confident delivery.", color: "#51CF66" },
    { id: "f2", type: "improvement", icon: "alert-circle", text: "Add a concrete result or outcome to your answer.", color: "#FFA500" },
    { id: "f3", type: "tip", icon: "lightbulb-on", text: "Use the STAR method to structure your response.", color: "#007AFF" },
  ],
  pronunciationScore: 84,
  fillerWordsCount: 3,
  modelAnswer: {
    structure: "STAR",
    situation: "In my previous role at a software company, I led a team of three developers.",
    task: "We needed to migrate a legacy API to a modern microservices architecture.",
    action: "I broke the work into milestones, ran weekly syncs, and introduced automated testing.",
    result: "We delivered on time with 40% fewer production incidents in the following quarter.",
  },
  duration: 95,
};

const MOCK_INTERVIEW_SUMMARY: InterviewSummary = {
  sessionId: "mock-session-1",
  overallScore: 74,
  percentile: 68,
  categoryScores: [
    { category: "Technical", score: 78, trend: "up" },
    { category: "Communication", score: 72, trend: "stable" },
    { category: "Behavioral", score: 70, trend: "up" },
  ],
  strengths: ["Clear articulation", "Good use of examples", "Confident tone"],
  focusAreas: ["Quantify results more concretely", "Reduce filler words", "Strengthen STAR method conclusions"],
  duration: 1240,
  completedAt: new Date().toISOString(),
  questionCount: 5,
};

const MOCK_REPORT: Report = {
  id: "report-mock-1",
  sessionId: "mock-session-1",
  candidateId: "candidate-1",
  createdAt: new Date().toISOString(),
  metadata: { interviewType: "practice", duration: 1240, questionCount: 5 },
  aiSummary:
    "Overall strong performance with clear communication. Focus on quantifying outcomes and reducing filler words to elevate responses from good to excellent.",
  scores: [
    { category: "Technical", score: 78, trend: "up" },
    { category: "Communication", score: 72, trend: "stable" },
    { category: "Behavioral", score: 70, trend: "up" },
  ],
  overallScore: 74,
  questions: [
    { questionId: "q1", text: "Tell me about yourself.", score: 76, duration: 95, feedback: "Good overview; add a specific achievement." },
    { questionId: "q2", text: "What is your greatest strength?", score: 80, duration: 88, feedback: "Strong answer with good examples." },
    { questionId: "q3", text: "Describe a challenge you overcame.", score: 72, duration: 110, feedback: "Include the measurable result next time." },
    { questionId: "q4", text: "Where do you see yourself in 5 years?", score: 68, duration: 75, feedback: "Be more specific about your career goals." },
    { questionId: "q5", text: "Why do you want this role?", score: 74, duration: 85, feedback: "Good motivation; link more to the company values." },
  ],
};

// ── Normalizers ───────────────────────────────────────────────────────────────

const normalizeLiveIndicators = (data: Record<string, unknown>): LiveIndicators => ({
  speakingPace: typeof data["speaking_pace"] === "number" ? (data["speaking_pace"] as number) : 0,
  clarity: typeof data["clarity"] === "number" ? (data["clarity"] as number) : 0,
  fillerCount: typeof data["filler_count"] === "number" ? (data["filler_count"] as number) : 0,
  confidence: typeof data["confidence"] === "number" ? (data["confidence"] as number) : 0,
  timestamp: typeof data["timestamp"] === "number" ? (data["timestamp"] as number) : Date.now(),
});

const normalizeQuestionFeedback = (data: Record<string, unknown>): QuestionFeedback => ({
  questionId: String(data.question_id ?? ""),
  questionText: String(data.question_text ?? ""),
  score: typeof data.score === "number" ? data.score : 0,
  breakdown: Array.isArray(data.breakdown)
    ? (data.breakdown as Record<string, unknown>[]).map((item) => ({
        label: String(item["label"] ?? ""),
        score: typeof item["score"] === "number" ? (item["score"] as number) : 0,
        weight: typeof item["weight"] === "number" ? (item["weight"] as number) : 0.25,
      }))
    : [],
  starAnalysis: (() => {
    const star = (data["star_analysis"] ?? {}) as Record<string, Record<string, unknown>>;
    const sit = (star["situation"] ?? {}) as Record<string, unknown>;
    const tsk = (star["task"] ?? {}) as Record<string, unknown>;
    const act = (star["action"] ?? {}) as Record<string, unknown>;
    const res = (star["result"] ?? {}) as Record<string, unknown>;
    return {
      situation: {
        present: sit["present"] === true,
        quality: (sit["quality"] as "weak" | "good" | "excellent") ?? "weak",
      },
      task: {
        present: tsk["present"] === true,
        quality: (tsk["quality"] as "weak" | "good" | "excellent") ?? "weak",
      },
      action: {
        present: act["present"] === true,
        quality: (act["quality"] as "weak" | "good" | "excellent") ?? "weak",
      },
      result: {
        present: res["present"] === true,
        quality: (res["quality"] as "weak" | "good" | "excellent") ?? "weak",
      },
      overallScore:
        typeof star["overall_score"] === "number" ? (star["overall_score"] as number) : 0,
    };
  })(),
  feedbackItems: Array.isArray(data["feedback_items"])
    ? (data["feedback_items"] as Record<string, unknown>[]).map((item) => ({
        id: String(item["id"] ?? ""),
        type: (item["type"] as "strength" | "improvement" | "tip") ?? "improvement",
        icon: String(item["icon"] ?? ""),
        text: String(item["text"] ?? ""),
        color: String(item["color"] ?? "#666"),
      }))
    : [],
  pronunciationScore:
    typeof data["pronunciation_score"] === "number" ? (data["pronunciation_score"] as number) : 0,
  fillerWordsCount:
    typeof data["filler_words_count"] === "number" ? (data["filler_words_count"] as number) : 0,
  modelAnswer: (() => {
    const ma = (data["model_answer"] ?? {}) as Record<string, unknown>;
    return {
      structure: String(ma["structure"] ?? "STAR"),
      situation: String(ma["situation"] ?? ""),
      task: String(ma["task"] ?? ""),
      action: String(ma["action"] ?? ""),
      result: String(ma["result"] ?? ""),
    };
  })(),
  duration: typeof data["duration"] === "number" ? (data["duration"] as number) : 0,
});

const normalizeInterviewSummary = (data: Record<string, unknown>): InterviewSummary => ({
  sessionId: String(data.session_id ?? ""),
  overallScore: typeof data.overall_score === "number" ? data.overall_score : 0,
  percentile: typeof data.percentile === "number" ? data.percentile : 0,
  categoryScores: Array.isArray(data.category_scores)
    ? (data.category_scores as Record<string, unknown>[]).map((item) => ({
        category: (item["category"] as "Technical" | "Communication" | "Behavioral") ?? "Technical",
        score: typeof item["score"] === "number" ? (item["score"] as number) : 0,
        trend: (item["trend"] as "up" | "down" | "stable") ?? "stable",
      }))
    : [],
  strengths: Array.isArray(data.strengths) ? (data.strengths as string[]).map(String) : [],
  focusAreas: Array.isArray(data.focus_areas) ? (data.focus_areas as string[]).map(String) : [],
  duration: typeof data.duration === "number" ? data.duration : 0,
  completedAt: String(data.completed_at ?? new Date().toISOString()),
  questionCount: typeof data.question_count === "number" ? data.question_count : 0,
});

const normalizeReport = (data: Record<string, unknown>): Report => ({
  id: String(data.id ?? ""),
  sessionId: String(data.session_id ?? ""),
  candidateId: String(data.candidate_id ?? ""),
  createdAt: String(data.created_at ?? new Date().toISOString()),
  metadata: (() => {
    const meta = (data["metadata"] ?? {}) as Record<string, unknown>;
    return {
      interviewType:
        (meta["interview_type"] as "practice" | "mock" | "real") ?? "practice",
      duration: typeof meta["duration"] === "number" ? (meta["duration"] as number) : 0,
      questionCount:
        typeof meta["question_count"] === "number" ? (meta["question_count"] as number) : 0,
    };
  })(),
  aiSummary: String(data.ai_summary ?? ""),
  scores: Array.isArray(data.scores)
    ? (data.scores as Record<string, unknown>[]).map((item) => ({
        category: (item["category"] as "Technical" | "Communication" | "Behavioral") ?? "Technical",
        score: typeof item["score"] === "number" ? (item["score"] as number) : 0,
        trend: (item["trend"] as "up" | "down" | "stable") ?? "stable",
      }))
    : [],
  overallScore: typeof data.overall_score === "number" ? (data.overall_score as number) : 0,
  questions: Array.isArray(data.questions)
    ? (data.questions as Record<string, unknown>[]).map((item) => ({
        questionId: String(item["question_id"] ?? ""),
        text: String(item["text"] ?? ""),
        score: typeof item["score"] === "number" ? (item["score"] as number) : 0,
        duration: typeof item["duration"] === "number" ? (item["duration"] as number) : 0,
        feedback: String(item["feedback"] ?? ""),
      }))
    : [],
  downloadUrl: data.download_url ? String(data.download_url) : undefined,
  shareUrl: data.share_url ? String(data.share_url) : undefined,
});

// ── API Slice ──────────────────────────────────────────────────────────────────

export const interviewFeedbackApi = createApi({
  reducerPath: "interviewFeedbackApi",
  baseQuery: fetchBaseQuery({ baseUrl: FULL_API_BASE_URL, prepareHeaders: (h) => { Object.entries(AUTH_HEADERS).forEach(([k, v]) => h.set(k, v)); return h; } }),
  tagTypes: ["LiveIndicators", "QuestionFeedback", "InterviewSummary", "Report"] as const,
  endpoints: (builder) => ({
    // Get live indicators for current question
    getLiveIndicators: builder.query<LiveIndicators, GetLiveIndicatorsArg>({
      queryFn: async ({ sessionId, questionId }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(150);
          return { data: MOCK_LIVE_INDICATORS };
        }
        const result = await baseQuery({
          url: `/interviews/${sessionId}/indicators/${questionId}`,
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (result.error) return { error: result.error };
        return { data: normalizeLiveIndicators(result.data as Record<string, unknown>) };
      },
      providesTags: (_result, _error, { sessionId, questionId }) => [
        { type: "LiveIndicators", id: `${sessionId}-${questionId}` },
      ],
    }),

    // Get detailed feedback for a specific question
    getQuestionFeedback: builder.query<QuestionFeedback, GetQuestionFeedbackArg>({
      queryFn: async ({ sessionId, questionId }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(300);
          return { data: { ...MOCK_QUESTION_FEEDBACK, questionId } };
        }
        const result = await baseQuery({
          url: `/interviews/${sessionId}/feedback/${questionId}`,
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (result.error) return { error: result.error };
        return { data: normalizeQuestionFeedback(result.data as Record<string, unknown>) };
      },
      providesTags: (_result, _error, { sessionId, questionId }) => [
        { type: "QuestionFeedback", id: `${sessionId}-${questionId}` },
      ],
    }),

    // Get summary for entire interview session
    getInterviewSummary: builder.query<InterviewSummary, GetInterviewSummaryArg>({
      queryFn: async ({ sessionId }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(400);
          return { data: { ...MOCK_INTERVIEW_SUMMARY, sessionId } };
        }
        const result = await baseQuery({
          url: `/interviews/${sessionId}/summary`,
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (result.error) return { error: result.error };
        return { data: normalizeInterviewSummary(result.data as Record<string, unknown>) };
      },
      providesTags: (_result, _error, { sessionId }) => [
        { type: "InterviewSummary", id: sessionId },
      ],
    }),

    // Get full detailed report
    // ✅ Real endpoint: GET /api/v1/interviews/sessions/{session_id}/result
    // Returns: { session_id, status, gap_analysis, responses[] }
    getFullReport: builder.query<Report, GetFullReportArg>({
      queryFn: async ({ reportId }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(350);
          return { data: { ...MOCK_REPORT, id: reportId } };
        }

        console.log("[FullReport] GET /interviews/sessions/" + reportId + "/result");

        const result = await baseQuery({
          url: `/interviews/sessions/${reportId}/result`,
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (result.error) {
          console.log("[FullReport] Error:", result.error);
          return { error: result.error };
        }

        const raw = result.data as Record<string, unknown>;
        console.log("[FullReport] Response:", JSON.stringify(raw).slice(0, 400));

        // Backend returns { session_id, status, gap_analysis, responses[] }
        // Map to Report shape for FullReportScreen
        const responses = Array.isArray(raw?.responses)
          ? (raw.responses as Record<string, unknown>[])
          : [];

        const questions: Report["questions"] = responses.map((r, i) => ({
          questionId: String(r["question_id"] ?? `q${i + 1}`),
          text: String(r["question_text"] ?? r["question"] ?? `Question ${i + 1}`),
          score: typeof r["confidence_score"] === "number"
            ? Math.round((r["confidence_score"] as number) * 100)
            : 0,
          duration: typeof r["duration"] === "number" ? (r["duration"] as number) : 0,
          feedback: String(r["feedback"] ?? ""),
        }));

        const overallScore = questions.length > 0
          ? Math.round(questions.reduce((s, q) => s + q.score, 0) / questions.length)
          : 0;

        return {
          data: {
            id: String(raw?.session_id ?? reportId),
            sessionId: String(raw?.session_id ?? reportId),
            candidateId: "",
            createdAt: new Date().toISOString(),
            metadata: {
              interviewType: "mock",
              duration: 0,
              questionCount: questions.length,
            },
            aiSummary: String(raw?.gap_analysis ?? raw?.feedback ?? ""),
            scores: [],
            overallScore,
            questions,
          },
        };
      },
      providesTags: (_result, _error, { reportId }) => [
        { type: "Report", id: reportId },
      ],
    }),

    // ── POST /interviews/sessions/{id}/generate-report ───────────────────────
    // ✅ New endpoint — generates a PDF report for a completed session.
    // Call this after all answers are submitted.
    // Response: { report_id, status }
    generateReport: builder.mutation<{ reportId: string; status: string }, string>({
      queryFn: async (sessionId, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(500);
          return { data: { reportId: `mock-report-${Date.now()}`, status: "generated" } };
        }

        console.log("[FullReport] POST generate-report for session:", sessionId);

        const result = await baseQuery({
          url: `/interviews/sessions/${sessionId}/generate-report`,
          method: "POST",
          headers: { Accept: "application/json" },
        });

        if (result.error) {
          console.log("[FullReport] Generate report error:", result.error);
          return { error: result.error };
        }

        const raw = result.data as Record<string, unknown>;
        console.log("[FullReport] Generate report response:", raw);

        return {
          data: {
            reportId: String(raw?.report_id ?? raw?.id ?? ""),
            status: String(raw?.status ?? "generated"),
          },
        };
      },
    }),

    // Download report as PDF with enhanced validation
    downloadReportPdf: builder.mutation<Blob, DownloadReportPdfArg>({
      queryFn: async ({ reportId }, _api, _extraOptions, _baseQuery) => {
        try {
          // Validate input
          if (!reportId) {
            return {
              error: { status: 400, data: "Report ID is required" },
            };
          }

          // ✅ Correct endpoint: GET /api/v1/interviews/report/{report_id}/pdf
          const url = `${API_V1_URL}/interviews/report/${reportId}/pdf`;
          console.log("[FullReport] GET PDF:", url);

          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/pdf",
              "Cache-Control": "no-cache",
              ...AUTH_HEADERS,
            },
          });

          // Validate response status
          if (!response.ok) {
            let errorMessage = "Failed to download PDF";

            switch (response.status) {
              case 401:
                errorMessage = "Unauthorized. Please log in again.";
                break;
              case 403:
                errorMessage = "Access denied. You do not have permission to download this report.";
                break;
              case 404:
                errorMessage = `Report not found (ID: ${reportId})`;
                break;
              case 500:
              case 502:
              case 503:
                errorMessage = "Server error. Please try again later.";
                break;
              default:
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }

            return {
              error: {
                status: response.status,
                data: errorMessage,
              },
            };
          }

          // Validate content-type
          const contentType = response.headers.get("content-type");
          if (contentType && !contentType.includes("application/pdf")) {
            return {
              error: {
                status: 422,
                data: `Invalid response format. Expected PDF but received ${contentType}`,
              },
            };
          }

          // Check content-length (if available)
          const contentLength = response.headers.get("content-length");
          if (contentLength) {
            const fileSizeBytes = parseInt(contentLength, 10);
            const fileSizeMB = fileSizeBytes / (1024 * 1024);

            // Enforce 50MB limit
            if (fileSizeMB > 50) {
              return {
                error: {
                  status: 413,
                  data: `File too large (${fileSizeMB.toFixed(2)}MB). Maximum size is 50MB.`,
                },
              };
            }
          }

          // Convert response to blob
          const blob = await response.blob();

          // Validate blob size
          if (blob.size === 0) {
            return {
              error: {
                status: 204,
                data: "Received empty PDF. Please try again.",
              },
            };
          }

          return { data: blob };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === "string"
                ? error
                : "Unknown error occurred";

          return {
            error: {
              status: "FETCH_ERROR" as const,
              error: errorMessage,
            },
          };
        }
      },
    }),

    // Share results via different channels
    shareResults: builder.mutation<{ success: boolean; shareUrl: string }, ShareResultsArg>({
      queryFn: async ({ reportId, type, message }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(200);
          return {
            data: {
              success: true,
              shareUrl: `https://app.interviewcoach.io/results/${reportId}`,
            },
          };
        }
        const result = await baseQuery({
          url: `/reports/${reportId}/share`,
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: { share_type: type, message: message || "" },
        });
        if (result.error) return { error: result.error };
        return { data: result.data as { success: boolean; shareUrl: string } };
      },
    }),
  }),
});

export const {
  useGetLiveIndicatorsQuery,
  useLazyGetLiveIndicatorsQuery,
  useGetQuestionFeedbackQuery,
  useLazyGetQuestionFeedbackQuery,
  useGetInterviewSummaryQuery,
  useLazyGetInterviewSummaryQuery,
  useGetFullReportQuery,
  useLazyGetFullReportQuery,
  useGenerateReportMutation,
  useDownloadReportPdfMutation,
  useShareResultsMutation,
} = interviewFeedbackApi;
