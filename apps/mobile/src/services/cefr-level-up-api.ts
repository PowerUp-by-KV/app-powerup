import { api } from "./api";

export interface LevelUpEvaluateResponse {
  can_level_up: boolean;
  current_level: string;
  next_level: string | null;
  jps_score: number;
  threshold: number;
  message?: string;
}

export interface LevelUpConfirmRequest {
  decision: "level_up" | "stay";
}

export interface LevelUpConfirmResponse {
  success: boolean;
  new_level: string;
  message: string;
}

export const cefrLevelUpApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    evaluateLevelUp: builder.mutation<LevelUpEvaluateResponse, void>({
      query: () => ({
        url: "/v1/users/level-up",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    confirmLevelUp: builder.mutation<LevelUpConfirmResponse, LevelUpConfirmRequest>({
      query: (body) => ({
        url: "/v1/users/level-up/confirm",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useEvaluateLevelUpMutation,
  useConfirmLevelUpMutation,
} = cefrLevelUpApi;
