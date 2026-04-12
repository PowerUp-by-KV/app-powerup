/**
 * src/services/mockInterviewApiSlice.ts
 *
 * RTK Query slice for the Mock Interview feature.
 *
 * ✅ Backend contract (v2) — all under /api/v1:
 *
 *   POST /api/v1/interviews/sessions
 *     Body:     { user_id: string }
 *     Response: { session_id, status, current_question: { id, text, options } }
 *
 *   POST /api/v1/interviews/sessions/{session_id}/answer
 *     Body:     FormData — field "file" (audio) + "question_id"
 *     Response: { session_complete, next_question, transcription, confidence_score }
 *
 *   GET  /api/v1/interviews/sessions/{session_id}/result
 *     Response: { session_id, status, gap_analysis, responses[] }
 *
 *   POST /api/v1/interviews/sessions/{session_id}/generate-report
 *     Response: { report_id, ... }
 *
 *   GET  /api/v1/interviews/sessions?candidate_id=...
 *     Response: array of session objects
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FULL_API_BASE_URL, API_V1_URL, USE_MOCK_API, AUTH_HEADERS } from "../constants/apiConfig";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InterviewQuestion {
  id: string;
  text: string;
  options: string[];
}

/** Returned by POST /sessions */
export interface StartSessionResponse {
  sessionId: string;
  status: string;
  currentQuestion: InterviewQuestion;
}

/** Returned by POST /sessions/{id}/answer */
export interface SubmitAnswerResponse {
  sessionComplete: boolean;
  nextQuestion: InterviewQuestion | null;
  transcription: string;
  confidenceScore: number;
}

/** Returned by GET /sessions/{id}/result */
export interface SessionResultResponse {
  sessionId: string;
  status: string;
  gap_analysis: string;
  responses: unknown[];
}

/** Returned by POST /sessions/{id}/generate-report */
export interface GenerateReportResponse {
  reportId: string;
  status: string;
}

// ── Normalizers ───────────────────────────────────────────────────────────────

const normalizeQuestion = (q: Record<string, unknown> | null | undefined): InterviewQuestion => ({
  id: String(q?.id ?? ""),
  text: String(q?.text ?? ""),
  options: Array.isArray(q?.options) ? (q!.options as string[]) : [],
});

// ── Mock data ─────────────────────────────────────────────────────────────────

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_QUESTIONS = [
  { id: "mq1", text: "Tell me about yourself.", options: [] },
  { id: "mq2", text: "What is your greatest strength?", options: [] },
  { id: "mq3", text: "Describe a challenge you overcame.", options: [] },
];

const MOCK_SESSIONS = [
  {
    session_id: "mock-session-1",
    response_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "completed",
  },
  {
    session_id: "mock-session-2",
    response_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "in_progress",
  },
];

// Shared mutable index so mock questions advance in sequence
let _mockQuestionIndex = 0;

// ── Slice ─────────────────────────────────────────────────────────────────────

export const mockInterviewApi = createApi({
  reducerPath: "mockInterviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: FULL_API_BASE_URL,
    prepareHeaders: (h) => {
      Object.entries(AUTH_HEADERS).forEach(([k, v]) => h.set(k, v));
      return h;
    },
  }),
  endpoints: (builder) => ({

    // ── GET /interviews/sessions?candidate_id=... ────────────────────────────
    getMockInterviewSessions: builder.query<unknown[], string>({
      queryFn: async (candidateId, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(300);
          return { data: MOCK_SESSIONS };
        }
        const url = `/interviews/sessions?candidate_id=${encodeURIComponent(candidateId)}`;
        console.log("[Mock Interview] GET sessions:", `${FULL_API_BASE_URL}${url}`);
        const result = await baseQuery({ url, method: "GET", headers: { Accept: "application/json" } });
        if (result.error) {
          console.log("[Mock Interview] Get sessions error:", result.error);
          return { error: result.error };
        }
        const data = result.data;
        return { data: Array.isArray(data) ? data : [] };
      },
    }),

    // ── GET /interviews/sessions/{id}/result ────────────────────────────────
    // ✅ New endpoint — was /feedback in v1
    getMockInterviewResult: builder.query<SessionResultResponse, string>({
      queryFn: async (sessionId, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(400);
          return {
            data: {
              sessionId: "mock-session-1",
              status: "completed",
              gap_analysis: "Overall strong performance. Focus on quantifying achievements and reducing filler words.",
              responses: [
                {
                  question_text: "Tell me about yourself.",
                  confidence_score: 0.82,
                  feedback: "Strong opening — add one concrete achievement.",
                  user_answer: "I am a mobile developer who builds useful apps.",
                  is_correct: true,
                },
                {
                  question_text: "What is your greatest strength?",
                  confidence_score: 0.74,
                  feedback: "Good strengths mentioned — link them more directly to the role.",
                  user_answer: "My communication skills and ability to deliver on time.",
                  is_correct: true,
                },
              ],
            },
          };
        }

        // ✅ Real endpoint: GET /api/v1/interviews/sessions/{id}/result
        console.log("[Mock Interview] GET result for session:", sessionId);
        const result = await baseQuery({
          url: `/interviews/sessions/${sessionId}/result`,
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (result.error) {
          console.log("[Mock Interview] Get result error:", result.error);
          return { error: result.error };
        }

        const raw = result.data as Record<string, unknown>;
        console.log("[Mock Interview] Result response:", raw);

        return {
          data: {
            sessionId: String(raw?.session_id ?? sessionId),
            status: String(raw?.status ?? "completed"),
            gap_analysis: String(raw?.gap_analysis ?? raw?.feedback ?? ""),
            responses: Array.isArray(raw?.responses) ? raw.responses : [],
          },
        };
      },
    }),

    // ── POST /interviews/sessions ────────────────────────────────────────────
    // Body: { user_id: string }
    // Response: { session_id, status, current_question: { id, text, options } }
    startInterviewSession: builder.mutation<StartSessionResponse, { candidateId: string }>({
      queryFn: async ({ candidateId }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(400);
          _mockQuestionIndex = 0;
          return {
            data: {
              sessionId: `mock-session-${Date.now()}`,
              status: "in_progress",
              currentQuestion: normalizeQuestion(MOCK_QUESTIONS[0]),
            },
          };
        }

        console.log("[Mock Interview] POST /interviews/sessions  user_id:", candidateId);

        const result = await baseQuery({
          url: "/interviews/sessions",
          method: "POST",
          body: { user_id: candidateId },
          headers: { "Content-Type": "application/json" },
        });

        if (result.error) {
          console.log("[Mock Interview] Start session error:", result.error);
          return { error: result.error };
        }

        const raw = result.data as Record<string, unknown>;
        console.log("[Mock Interview] Start response:", raw);

        const currentQ = raw?.current_question as Record<string, unknown> | undefined;

        return {
          data: {
            sessionId: String(raw?.session_id ?? ""),
            status: String(raw?.status ?? "in_progress"),
            currentQuestion: normalizeQuestion(currentQ),
          },
        };
      },
    }),

    // ── POST /interviews/sessions/{id}/answer ────────────────────────────────
    // Body: FormData — field "file" (audio) + "question_id"
    // Response: { session_complete, next_question, transcription, confidence_score }
    submitMockInterviewAudio: builder.mutation<
      SubmitAnswerResponse,
      { sessionId: string; questionId: string; audioUri: string }
    >({
      queryFn: async ({ sessionId, questionId, audioUri }) => {
        if (USE_MOCK_API) {
          await wait(600);
          _mockQuestionIndex += 1;
          const nextQ = MOCK_QUESTIONS[_mockQuestionIndex] ?? null;
          return {
            data: {
              sessionComplete: nextQ === null,
              nextQuestion: nextQ ? normalizeQuestion(nextQ) : null,
              transcription: "Mock transcription of the recorded answer.",
              confidenceScore: 0.75 + Math.random() * 0.2,
            },
          };
        }

        try {
          const formData = new FormData();
          formData.append("question_id", String(questionId));

          if (audioUri) {
            const lower = audioUri.toLowerCase();
            let fileName = "answer.m4a";
            let mimeType = "audio/m4a";
            if (lower.endsWith(".wav"))  { fileName = "answer.wav";  mimeType = "audio/wav"; }
            else if (lower.endsWith(".mp3"))  { fileName = "answer.mp3";  mimeType = "audio/mpeg"; }
            else if (lower.endsWith(".webm")) { fileName = "answer.webm"; mimeType = "audio/webm"; }
            else if (lower.endsWith(".aac"))  { fileName = "answer.aac";  mimeType = "audio/aac"; }

            formData.append("file", { uri: audioUri, name: fileName, type: mimeType } as unknown as Blob);
          }

          // ✅ Native fetch — do NOT set Content-Type so the runtime auto-sets
          // the multipart/form-data boundary (RTK Query baseQuery would corrupt it).
          const url = `${API_V1_URL}/interviews/sessions/${sessionId}/answer`;
          console.log("[Mock Interview] POST answer to:", url);
          console.log("[Mock Interview] question_id:", questionId, "audioUri:", audioUri);

          const response = await fetch(url, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json", ...AUTH_HEADERS },
          });

          const responseText = await response.text();
          console.log("[Mock Interview] Answer status:", response.status);
          console.log("[Mock Interview] Answer response:", responseText.slice(0, 400));

          if (!response.ok) {
            return { error: { status: response.status, data: responseText } };
          }

          const raw = JSON.parse(responseText) as Record<string, unknown>;
          const nextQRaw = raw?.next_question as Record<string, unknown> | null;

          return {
            data: {
              sessionComplete: Boolean(raw?.session_complete),
              nextQuestion: nextQRaw ? normalizeQuestion(nextQRaw) : null,
              transcription: String(raw?.transcription ?? ""),
              confidenceScore: typeof raw?.confidence_score === "number" ? raw.confidence_score : 0,
            },
          };
        } catch (err) {
          console.log("[Mock Interview] Answer error:", err);
          return { error: { status: "FETCH_ERROR" as const, error: String(err) } };
        }
      },
    }),

    // ── POST /interviews/sessions/{id}/generate-report ───────────────────────
    // Call after session is complete to generate the PDF report.
    // Response: { report_id, status }
    generateInterviewReport: builder.mutation<GenerateReportResponse, string>({
      queryFn: async (sessionId, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(500);
          return {
            data: {
              reportId: `mock-report-${Date.now()}`,
              status: "generated",
            },
          };
        }

        console.log("[Mock Interview] POST generate-report for session:", sessionId);

        const result = await baseQuery({
          url: `/interviews/sessions/${sessionId}/generate-report`,
          method: "POST",
          headers: { Accept: "application/json" },
        });

        if (result.error) {
          console.log("[Mock Interview] Generate report error:", result.error);
          return { error: result.error };
        }

        const raw = result.data as Record<string, unknown>;
        console.log("[Mock Interview] Generate report response:", raw);

        return {
          data: {
            reportId: String(raw?.report_id ?? raw?.id ?? ""),
            status: String(raw?.status ?? "generated"),
          },
        };
      },
    }),
  }),
});

export const {
  useGetMockInterviewSessionsQuery,
  useLazyGetMockInterviewSessionsQuery,
  useGetMockInterviewResultQuery,
  useLazyGetMockInterviewResultQuery,
  useStartInterviewSessionMutation,
  useSubmitMockInterviewAudioMutation,
  useGenerateInterviewReportMutation,
} = mockInterviewApi;
