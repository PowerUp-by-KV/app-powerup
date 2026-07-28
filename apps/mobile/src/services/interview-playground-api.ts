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
      { sessionId: string; body: SaveSessionBody }
    >({
      query: ({ sessionId, body }) => ({
        url: `/v1/interview/webrtc/sessions/${sessionId}/save`,
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

    getInterviewSession: builder.query<InterviewSessionDetail, string>({
      query: (sessionId) => `/v1/interview/webrtc/sessions/${sessionId}`,
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

    savePipelineSession: builder.mutation<
      SaveSessionResponse,
      { sessionId: string; body: SaveSessionBody }
    >({
      query: ({ sessionId, body }) => ({
        url: `/v1/coach/pipeline/sessions/${sessionId}/complete`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["InterviewPlayground"],
    }),

    listPipelineSessions: builder.query<InterviewSessionSummary[], void>({
      query: () => "/v1/coach/pipeline/sessions",
      providesTags: ["InterviewPlayground"],
    }),

    getPipelineSession: builder.query<InterviewSessionDetail, string>({
      query: (sessionId) => `/v1/coach/pipeline/sessions/${sessionId}`,
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
