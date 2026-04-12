/**
 * src/features/interview/interviewApiSlice.ts
 *
 * RTK Query slice for mock interview session operations.
 * Endpoints: startInterviewSession, submitMockInterviewAudio, getMockInterviewResult
 *
 * getMockInterviewResult here returns the NORMALIZED (camelCase) shape.
 * Use mockInterviewApiSlice's hook when raw backend data is needed.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_V1_URL, USE_MOCK_API, AUTH_HEADERS } from "../constants/apiConfig";
import type {
  NormalizedInterviewQuestion,
  NormalizedInterviewSession,
  NormalizedInterviewResult,
} from "../types/mockInterview";

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_QUESTIONS = [
  { id: "q1", text: "Tell me about yourself.", difficulty: "easy", skill_id: "intro" },
  { id: "q2", text: "What is your greatest strength?", difficulty: "easy", skill_id: "strength" },
  {
    id: "q3",
    text: "Describe a time you solved a difficult problem.",
    difficulty: "medium",
    skill_id: "problem-solving",
  },
];

const MOCK_RESULT = {
  session_id: "mock-session-1",
  status: "completed",
  gap_analysis:
    "You answered confidently, but give more concrete examples for technical questions.",
  responses: [
    {
      question_text: "Tell me about yourself.",
      confidence_score: 0.85,
      feedback: "Good introduction; add one strong accomplishment.",
      user_answer: "I have spent the last 5 years building mobile apps.",
      is_correct: true,
    },
    {
      question_text: "What is your greatest strength?",
      confidence_score: 0.78,
      feedback: "Solid answer; be more specific about outcomes.",
      user_answer: "My greatest strength is my attention to detail.",
      is_correct: true,
    },
    {
      question_text: "Describe a time you solved a difficult problem.",
      confidence_score: 0.72,
      feedback: "Nice storytelling; include the result and impact.",
      user_answer: "I refactored a legacy feature to reduce crashes.",
      is_correct: true,
    },
  ],
};

// ── Types ─────────────────────────────────────────────────────────────────────

// Shared types live in src/types/mockInterview.ts.
// Re-exported here so existing imports from this slice continue to work.
export type {
  NormalizedInterviewQuestion,
  NormalizedInterviewSession,
  NormalizedInterviewResponse,
  NormalizedInterviewResult,
} from "../types/mockInterview";

interface StartInterviewSessionArg {
  candidateId: string;
}
interface SubmitMockInterviewAudioArg {
  audioUri: string;
  sessionId: string;
  questionId?: string; // optional — included in FormData when provided
}

// ── Normalizers ──────────────────────────────────────────────────────────────

const normalizeQuestion = (q: Record<string, unknown>): NormalizedInterviewQuestion => ({
  id: String(q["id"] ?? ""),
  text: String(q["text"] ?? ""),
  difficulty: String(q["difficulty"] ?? ""),
  skillId: String(q["skill_id"] ?? ""),
});

const normalizeStartSessionResponse = (
  data: Record<string, unknown>,
): NormalizedInterviewSession => ({
  sessionId: String(data["session_id"] ?? ""),
  questions: Array.isArray(data["questions"])
    ? (data["questions"] as Record<string, unknown>[]).map(normalizeQuestion)
    : [],
});

const normalizeMockInterviewResult = (
  data: Record<string, unknown>,
): NormalizedInterviewResult => ({
  sessionId: String(data["session_id"] ?? ""),
  status: String(data["status"] ?? ""),
  gapAnalysis: String(data["gap_analysis"] ?? ""),
  responses: Array.isArray(data["responses"])
    ? (data["responses"] as Record<string, unknown>[]).map((item) => ({
        questionText: String(item["question_text"] ?? ""),
        userAnswer: String(item["user_answer"] ?? ""),
        confidenceScore:
          typeof item["confidence_score"] === "number" ? item["confidence_score"] : null,
        isCorrect: typeof item["is_correct"] === "boolean" ? item["is_correct"] : null,
        feedback: String(item["feedback"] ?? ""),
      }))
    : [],
});

// ── Audio helper ─────────────────────────────────────────────────────────────

const getAudioFileForUpload = async (audioUri: string) => {
  if (!audioUri) throw new Error("No audio URI found.");

  if (Platform.OS === "web") {
    const blob = await (await fetch(audioUri)).blob();
    return { file: blob as Blob, fileName: "mock_session.webm", isBlob: true };
  }

  const lower = audioUri.toLowerCase();
  let mimeType = "audio/m4a";
  let fileName = "mock_session.m4a";

  if (lower.endsWith(".wav")) {
    mimeType = "audio/wav";
    fileName = "mock_session.wav";
  } else if (lower.endsWith(".mp3")) {
    mimeType = "audio/mpeg";
    fileName = "mock_session.mp3";
  } else if (lower.endsWith(".aac")) {
    mimeType = "audio/aac";
    fileName = "mock_session.aac";
  } else if (lower.endsWith(".caf")) {
    mimeType = "audio/x-caf";
    fileName = "mock_session.caf";
  } else if (lower.endsWith(".webm")) {
    mimeType = "audio/webm";
    fileName = "mock_session.webm";
  }

  return { file: { uri: audioUri, name: fileName, type: mimeType }, fileName, isBlob: false };
};

// ── Slice ─────────────────────────────────────────────────────────────────────

export const interviewApi = createApi({
  reducerPath: "interviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_V1_URL,
    prepareHeaders: (h) => {
      Object.entries(AUTH_HEADERS).forEach(([k, v]) => h.set(k, v));
      return h;
    },
  }),
  endpoints: (builder) => ({
    startInterviewSession: builder.mutation<NormalizedInterviewSession, StartInterviewSessionArg>({
      queryFn: async ({ candidateId }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(350);
          return {
            data: normalizeStartSessionResponse({
              session_id: "mock-session-1",
              questions: MOCK_QUESTIONS,
            }),
          };
        }

        console.log("[Interview] POST /interviews/sessions  user_id:", candidateId);
        const result = await baseQuery({
          url: "/interviews/sessions",
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: { user_id: String(candidateId) },
        });
        if (result.error) {
          console.log("[Interview] Start session error:", result.error);
          return { error: result.error };
        }
        console.log("[Interview] Start session response:", result.data);
        return {
          data: normalizeStartSessionResponse(result.data as Record<string, unknown>),
        };
      },
    }),

    submitMockInterviewAudio: builder.mutation<unknown, SubmitMockInterviewAudioArg>({
      queryFn: async ({ audioUri, sessionId, questionId }) => {
        if (USE_MOCK_API) {
          await wait(600);
          return { data: { session_id: sessionId, uploaded: true } };
        }

        try {
          const formData = new FormData();
          if (questionId) formData.append("question_id", String(questionId));
          const audioFile = await getAudioFileForUpload(audioUri);
          if (audioFile.isBlob) {
            formData.append("file", audioFile.file as Blob, audioFile.fileName);
          } else {
            formData.append("file", audioFile.file as unknown as Blob);
          }

          // ⚠️  Use native fetch — do NOT set Content-Type so the runtime
          // sets the correct multipart/form-data boundary automatically.
          // RTK Query baseQuery can corrupt the boundary when headers + FormData
          // are combined.
          const url = `${API_V1_URL}/interviews/sessions/${sessionId}/answer`;
          console.log("[Interview] POST audio answer to:", url);

          const response = await fetch(url, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json", ...AUTH_HEADERS },
          });

          const responseText = await response.text();
          console.log("[Interview] Answer status:", response.status, responseText.slice(0, 300));

          if (!response.ok) {
            return { error: { status: response.status, data: responseText } };
          }

          const data = JSON.parse(responseText) as unknown;
          return { data };
        } catch (err) {
          console.log("[Interview] Answer error:", err);
          return { error: { status: "FETCH_ERROR" as const, error: String(err) } };
        }
      },
    }),

    // ── POST /interviews/sessions/{id}/generate-report ──────────────────────
    // Call after all answers are submitted to generate the PDF report.
    // Response: { report_id, status }
    generateInterviewReport: builder.mutation<{ reportId: string; status: string }, string>({
      queryFn: async (sessionId, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(500);
          return { data: { reportId: `mock-report-${Date.now()}`, status: "generated" } };
        }

        console.log("[Interview] POST generate-report for session:", sessionId);
        const result = await baseQuery({
          url: `/interviews/sessions/${sessionId}/generate-report`,
          method: "POST",
          headers: { Accept: "application/json" },
        });
        if (result.error) {
          console.log("[Interview] Generate report error:", result.error);
          return { error: result.error };
        }
        const raw = result.data as Record<string, unknown>;
        console.log("[Interview] Generate report response:", raw);
        return {
          data: {
            reportId: String(raw?.report_id ?? raw?.id ?? ""),
            status: String(raw?.status ?? "generated"),
          },
        };
      },
    }),

    getMockInterviewResult: builder.query<NormalizedInterviewResult, string>({
      queryFn: async (sessionId, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(250);
          return { data: normalizeMockInterviewResult(MOCK_RESULT) };
        }

        // ✅ Real endpoint: GET /api/v1/interviews/sessions/{id}/result
        console.log("[Interview] GET result for session:", sessionId);
        const result = await baseQuery({
          url: `/interviews/sessions/${sessionId}/result`,
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (result.error) {
          console.log("[Interview] Get result error:", result.error);
          return { error: result.error };
        }
        console.log("[Interview] Result response:", result.data);
        return {
          data: normalizeMockInterviewResult(result.data as Record<string, unknown>),
        };
      },
    }),
  }),
});

export const {
  useStartInterviewSessionMutation,
  useSubmitMockInterviewAudioMutation,
  useGenerateInterviewReportMutation,
  useGetMockInterviewResultQuery,
  useLazyGetMockInterviewResultQuery,
} = interviewApi;
