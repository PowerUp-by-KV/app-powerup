import { api } from "./api";
import { LEADERBOARD } from "@/constants/mockData";

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  streak: number;
  photo: string | null;
}

export const leaderboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLeaderboard: builder.query<LeaderboardEntry[], void>({
      query: () => "/leaderboard",
      transformResponse: (response: LeaderboardEntry[]) => response || LEADERBOARD,
    }),
  }),
});

export const { useGetLeaderboardQuery } = leaderboardApi;
