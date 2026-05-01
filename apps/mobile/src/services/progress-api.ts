import { api } from "./api";
import { ApiResponse, ProgressSummary, HeatmapData, TrendData, Badge } from "./types";

export const progressApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProgressSummary: builder.query<ProgressSummary, string>({
      query: (userId) => ({
        url: "/v1/progress/summary",
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
        url: "/v1/progress/heatmap",
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
        url: "/v1/progress/trend",
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
        url: "/v1/progress/badges",
        params: { userId },
      }),
      transformResponse: (response: ApiResponse<Badge[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Results", id: `BADGES-${userId}` }],
    }),
  }),
});

export const {
  useGetProgressSummaryQuery,
  useGetHeatmapDataQuery,
  useGetTrendDataQuery,
  useGetBadgesQuery,
} = progressApi;
