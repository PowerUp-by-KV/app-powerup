import { api } from "./api";
import { ProgressSummary, HeatmapData, TrendData, Badge, ApiResponse } from "./types";

export const progressApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProgressSummary: builder.query<ApiResponse<ProgressSummary>, string>({
      query: (userId) => `/api/v1/progress/${userId}/summary`,
      providesTags: ["Streak"], // Using Streak tag for progress summary updates
    }),
    getHeatmapData: builder.query<ApiResponse<HeatmapData>, string>({
      query: (userId) => `/api/v1/analytics/heatmap/${userId}`,
    }),
    getTrendsData: builder.query<ApiResponse<TrendData>, { userId: string; period?: string }>({
      query: ({ userId, period = "30d" }) => `/api/v1/analytics/trends/${userId}?period=${period}`,
    }),
    getBadges: builder.query<ApiResponse<Badge[]>, string>({
      query: (userId) => `/api/v1/badges/${userId}`,
    }),
  }),
});

export const {
  useGetProgressSummaryQuery,
  useGetHeatmapDataQuery,
  useGetTrendsDataQuery,
  useGetBadgesQuery,
} = progressApi;
