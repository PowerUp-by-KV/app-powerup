import { api } from "./api";
import { ApiResponse, BehaviorQuestion, BehaviorTrackRequest, BehaviorReport } from "./types";
import { behaviouralData as MOCK_BEHAVIOR_QUESTIONS } from "@/constants/behaviouralData";

const behaviorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBehaviorQuestions: builder.query<BehaviorQuestion[], void>({
      query: () => "/api/behavior/questions",
      transformResponse: (response: ApiResponse<BehaviorQuestion[]>) => {
        return response?.success ? response.data : (MOCK_BEHAVIOR_QUESTIONS as any);
      },
      providesTags: ["Behavior"],
    }),

    trackBehavior: builder.mutation<void, BehaviorTrackRequest>({
      query: (body) => ({
        url: "/api/behavior/track",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<void>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      invalidatesTags: ["Behavior"],
    }),

    getBehaviorReport: builder.query<BehaviorReport, string>({
      query: (userId) => `/api/behavior/report/${userId}`,
      transformResponse: (response: ApiResponse<BehaviorReport>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Behavior", id: `REP-${userId}` }],
    }),

    getBehaviorRetryQuestion: builder.query<BehaviorQuestion, string>({
      query: (questionId) => `/api/behavior/retry?questionId=${questionId}`,
      transformResponse: (response: ApiResponse<BehaviorQuestion>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, questionId) => [
        { type: "Behavior", id: `RETRY-${questionId}` },
      ],
    }),
  }),
});

export const {
  useGetBehaviorQuestionsQuery,
  useTrackBehaviorMutation,
  useGetBehaviorReportQuery,
  useGetBehaviorRetryQuestionQuery,
} = behaviorApi;
