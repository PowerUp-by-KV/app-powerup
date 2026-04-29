import { api } from "./api";
import { ApiResponse } from "./types";

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
}

export const leaderboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLeaderboard: builder.query<LeaderboardEntry[], { category: string; limit?: number }>({
      query: (params) => ({
        url: "/leaderboard",
        params,
      }),
      transformResponse: (response: ApiResponse<LeaderboardEntry[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: ["Results"],
    }),
  }),
});

export const { useGetLeaderboardQuery } = leaderboardApi;
