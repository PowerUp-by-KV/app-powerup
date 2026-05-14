import { api } from "./api";
import { ApiResponse } from "./types";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  unlocked_at?: string;
  is_locked: boolean;
  category: string;
  accent_color?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  icon: string;
  is_unlocked: boolean;
  status: "locked" | "unlocked" | "current";
  x: number;
  y: number;
}

export interface UserStats {
  xp_points: number;
  medals: number;
  accuracy: number;
  level: number;
}

export const rewardsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAchievements: builder.query<Achievement[], string>({
      query: (userId) => ({
        url: "/rewards/achievements",
        params: { userId },
      }),
      transformResponse: (response: ApiResponse<Achievement[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Results", id: `ACHIEVEMENTS-${userId}` }],
    }),

    getSkillTree: builder.query<SkillNode[], string>({
      query: (userId) => ({
        url: "/rewards/skills",
        params: { userId },
      }),
      transformResponse: (response: ApiResponse<SkillNode[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Results", id: `SKILLS-${userId}` }],
    }),

    getUserStats: builder.query<UserStats, string>({
      query: (userId) => ({
        url: "/rewards/stats",
        params: { userId },
      }),
      transformResponse: (response: ApiResponse<UserStats>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Results", id: `STATS-${userId}` }],
    }),
  }),
});

export const { useGetAchievementsQuery, useGetSkillTreeQuery, useGetUserStatsQuery } = rewardsApi;
