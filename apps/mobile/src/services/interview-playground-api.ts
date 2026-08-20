import { api } from "./api";
import type {
  StartInterviewResponse,
  SaveSessionBody,
  SaveSessionResponse,
  InterviewSessionSummary,
  InterviewSessionDetail,
} from "@/features/interview-playground/types";

export interface PipelineStartResponse {
  session_id: string;
  derived_role: string;
  candidate_name: string | null;
  websocket_url: string;
  filler_audio_url: string;
}

export const interviewPlaygroundApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // WebRTC (premium)
    startWebRTCInterview: builder.mutation<
      StartInterviewResponse,
      { mode?: "buddy" | "playground" } | void
    >({
      query: (arg) => ({
        url: arg?.mode === "buddy" ? "/v1/coach/webrtc/start" : "/v1/interview/webrtc/start",
        method: "POST",
        body: { mode: arg?.mode ?? "playground" },
      }),
    }),

    saveInterviewSession: builder.mutation<
      SaveSessionResponse,
      { sessionId: string; mode?: "buddy" | "playground"; body: SaveSessionBody }
    >({
      query: ({ sessionId, mode, body }) => ({
        url:
          mode === "buddy"
            ? `/v1/coach/webrtc/sessions/${sessionId}/complete`
            : `/v1/interview/webrtc/sessions/${sessionId}/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["InterviewPlayground"],
    }),

    listInterviewSessions: builder.query<
      InterviewSessionSummary[],
      { mode?: "buddy" | "playground" } | void
    >({
      query: (arg) => {
        const mode = arg?.mode;
        return mode === "buddy"
          ? "/v1/coach/webrtc/sessions"
          : mode === "playground"
            ? "/v1/interview/webrtc/sessions?mode=playground"
            : "/v1/interview/webrtc/sessions";
      },
      providesTags: ["InterviewPlayground"],
    }),

    getInterviewSession: builder.query<
      InterviewSessionDetail,
      { sessionId: string; mode?: "buddy" | "playground" } | string
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.sessionId;
        const mode = typeof arg === "string" ? "playground" : (arg.mode ?? "playground");
        return mode === "buddy"
          ? `/v1/coach/webrtc/sessions/${id}`
          : `/v1/interview/webrtc/sessions/${id}`;
      },
      providesTags: ["InterviewPlayground"],
    }),

    // Pipeline (pro)
    startPipelineInterview: builder.mutation<
      PipelineStartResponse,
      { mode?: "buddy" | "playground" } | void
    >({
      query: (arg) => ({
        url: arg?.mode === "buddy" ? "/v1/coach/pipeline/start" : "/v1/interview/pipeline/start",
        method: "POST",
        body: { mode: arg?.mode ?? "playground" },
      }),
    }),

    // FIXED: previously hardcoded to the coach endpoint with no `mode`
    // parameter at all, so a Playground session's save fallback silently
    // hit the wrong resource (and would 404, same as getPipelineSession
    // did for results loading). Path confirmed against
    // app/controllers/routes/interview_playground.py — the Playground
    // router uses `/save`, NOT `/complete` (that's the Coach router's
    // naming convention only; the two routers don't share one).
    savePipelineSession: builder.mutation<
      SaveSessionResponse,
      { sessionId: string; mode?: "buddy" | "playground"; body: SaveSessionBody }
    >({
      query: ({ sessionId, mode, body }) => ({
        url:
          mode === "buddy"
            ? `/v1/coach/pipeline/sessions/${sessionId}/complete`
            : `/v1/interview/pipeline/sessions/${sessionId}/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["InterviewPlayground"],
    }),

    // FIXED: previously hardcoded to `/v1/coach/pipeline/sessions` with no
    // way to list Playground pipeline sessions at all.
    listPipelineSessions: builder.query<
      InterviewSessionSummary[],
      { mode?: "buddy" | "playground" } | void
    >({
      query: (arg) =>
        arg?.mode === "buddy" ? "/v1/coach/pipeline/sessions" : "/v1/interview/pipeline/sessions",
      providesTags: ["InterviewPlayground"],
    }),

    // FIXED: this is the root cause of "results failed to load" — it was
    // hardcoded to the coach endpoint regardless of which mode actually
    // created the session, so every Playground pipeline session's results
    // lookup 404'd by construction (confirmed against server logs showing
    // GET /v1/coach/pipeline/sessions/{playground_session_id} -> 404).
    getPipelineSession: builder.query<
      InterviewSessionDetail,
      { sessionId: string; mode?: "buddy" | "playground" }
    >({
      query: ({ sessionId, mode }) =>
        mode === "buddy"
          ? `/v1/coach/pipeline/sessions/${sessionId}`
          : `/v1/interview/pipeline/sessions/${sessionId}`,
      providesTags: ["InterviewPlayground"],
    }),
  }),
});

export const {
  useStartWebRTCInterviewMutation,
  useSaveInterviewSessionMutation,
  useListInterviewSessionsQuery,
  useGetInterviewSessionQuery,
  useStartPipelineInterviewMutation,
  useSavePipelineSessionMutation,
  useListPipelineSessionsQuery,
  useGetPipelineSessionQuery,
} = interviewPlaygroundApi;
