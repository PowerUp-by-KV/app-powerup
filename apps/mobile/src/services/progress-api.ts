import { api } from "./api";
import { ApiResponse, ProgressSummary, HeatmapData, TrendData, Badge } from "./types";

export const progressApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProgressSummary: builder.query<ProgressSummary, string>({
      query: (userId) => ({
        url: "/progress/summary",
        params: { userId },
      }),
      transformResponse: (response: ApiResponse<ProgressSummary>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Results", id: `SUMMARY-${userId}` }],
    }),

    getHeatmapData: builder.query<HeatmapData, string>({
      query: (userId) => ({
        url: "/progress/heatmap",
        params: { userId },
      }),
      transformResponse: (response: ApiResponse<HeatmapData>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Results", id: `HEATMAP-${userId}` }],
    }),

    getTrendData: builder.query<TrendData, { userId: string; module: string }>({
      query: ({ userId, module }) => ({
        url: "/progress/trend",
        params: { userId, module },
      }),
      transformResponse: (response: ApiResponse<TrendData>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, { userId, module }) => [
        { type: "Results", id: `TREND-${userId}-${module}` },
      ],
    }),

    getBadges: builder.query<Badge[], string>({
      query: (userId) => ({
        url: "/progress/badges",
        params: { userId },
      }),
      transformResponse: (response: ApiResponse<Badge[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Results", id: `BADGES-${userId}` }],
    }),

    getAssessmentResult: builder.query<any, string>({
      // MOCK ENDPOINT
      query: (moduleId) => ({
        url: `/progress/assessment/${moduleId}`,
      }),
      // Simulated response matching the requested design
      transformResponse: () => {
        return {
          overallScore: 5.0,
          totalScore: 100,
          maxScore: 6,
          maxTotalPoints: 120,
          cefrLevel: "C1",
          readingScore: 5.0,
          listeningScore: 5.0,
          writingScore: 4.0,
          speakingScore: 6.0,
        };
      },
    }),
  }),
});

export const {
  useGetProgressSummaryQuery,
  useGetHeatmapDataQuery,
  useGetTrendDataQuery,
  useGetBadgesQuery,
  useGetAssessmentResultQuery,
} = progressApi;
