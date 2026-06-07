import { api } from "./api";
import type {
  StartInterviewResponse,
  SaveSessionBody,
  SaveSessionResponse,
  InterviewSessionSummary,
  InterviewSessionDetail,
} from "@/features/interview-playground/types";

export const interviewPlaygroundApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    startWebRTCInterview: builder.mutation<
      StartInterviewResponse,
      { mode?: "buddy" | "playground" } | void
    >({
      query: (arg) => ({
        url: "/v1/interview/start",
        method: "POST",
        body: { mode: arg && "mode" in arg ? (arg.mode ?? "playground") : "playground" },
      }),
    }),

    saveInterviewSession: builder.mutation<
      SaveSessionResponse,
      { sessionId: string; body: SaveSessionBody }
    >({
      query: ({ sessionId, body }) => ({
        url: `/v1/interview/sessions/${sessionId}/save`,
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
        const mode = arg && "mode" in arg ? arg.mode : undefined;
        return mode ? `/v1/interview/sessions?mode=${mode}` : "/v1/interview/sessions";
      },
      providesTags: ["InterviewPlayground"],
    }),

    getInterviewSession: builder.query<InterviewSessionDetail, string>({
      query: (sessionId) => `/v1/interview/sessions/${sessionId}`,
      providesTags: ["InterviewPlayground"],
    }),
  }),
});

export const {
  useStartWebRTCInterviewMutation,
  useSaveInterviewSessionMutation,
  useListInterviewSessionsQuery,
  useGetInterviewSessionQuery,
} = interviewPlaygroundApi;
