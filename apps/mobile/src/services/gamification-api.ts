import { api } from "./api";

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  xp_reward: number;
  icon_key: string;
  unlocked_at: string | null;
  progress: number;
  progress_label: string | null;
  times_shared: number;
}

export interface AchievementsList {
  recent: Achievement[];
  locked: Achievement[];
  total_unlocked: number;
}

export interface MedalLite {
  id: string;
  code: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  title: string;
  icon_key: string;
}

export interface MedalProgress {
  medal_id: string;
  title: string;
  progress: number;
  label: string;
}

export interface MedalsResponse {
  trophy_hero: { title: string; icon: string };
  unlocked: MedalLite[];
  locked: (MedalLite & { progress: number })[];
  level_up_progress: MedalProgress[];
}

export interface SkillNode {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  x: number;
  y: number;
  connects_to: string[];
}

export interface SkillsResponse {
  unlocked_count: number;
  total_count: number;
  nodes: SkillNode[];
}

export type AccuracyScope = "learning" | "interview_playground" | "interview_buddy";

export interface AccuracyResponse {
  overall: { percentage: number; correct: number; wrong: number; total: number };
  learning_activity: { by_skill: Array<{ skill: string; score: number }> };
  interview_charts: {
    communication: Array<{ label: string; x: number; y: number }>;
    behavior: Array<{ label: string; x: number; y: number }>;
  };
}

export const gamificationApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    listAchievements: builder.query<AchievementsList, void>({
      query: () => "/v1/achievements",
      providesTags: ["Achievements"],
    }),
    getAchievement: builder.query<Achievement, string>({
      query: (id) => `/v1/achievements/${id}`,
      providesTags: ["Achievements"],
    }),
    shareAchievement: builder.mutation<{ times_shared: number }, string>({
      query: (id) => ({ url: `/v1/achievements/${id}/share`, method: "POST" }),
      invalidatesTags: ["Achievements"],
    }),
    getMedals: builder.query<MedalsResponse, void>({
      query: () => "/v1/medals",
      providesTags: ["Achievements"],
    }),
    getSkills: builder.query<SkillsResponse, void>({
      query: () => "/v1/skills",
      providesTags: ["Achievements"],
    }),
    getAccuracy: builder.query<AccuracyResponse, AccuracyScope>({
      query: (scope) => `/v1/analytics/accuracy?scope=${scope}`,
      providesTags: ["Achievements"],
    }),
  }),
});

export const {
  useListAchievementsQuery,
  useGetAchievementQuery,
  useShareAchievementMutation,
  useGetMedalsQuery,
  useGetSkillsQuery,
  useGetAccuracyQuery,
} = gamificationApi;
