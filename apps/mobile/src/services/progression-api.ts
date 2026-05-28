import { api } from "./api";

// ==========================================
// 1. Core Progression Types
// ==========================================

export interface ProgressionModuleRead {
  module_id: string;
  module_no: number;
  title: string;
  completed: boolean;
  locked: boolean;
  unlocked_days: number[];
  wave: number;
}

export interface ProgressionRead {
  current_wave: number;
  current_day_phase: number[];
  unlocked_modules: ProgressionModuleRead[];
}

// ==========================================
// 2. Module Response Types
// ==========================================

export interface ModuleResponse {
  id: string;
  title: string;
  order_index: number;
  is_active: boolean;
}

export interface ModuleVariantResponse {
  id: string;
  cefr_level: string;
}

export interface ModuleProgressResponse {
  total_activities: number;
  completed_activities: number;
  progress_percentage: number;
  current_day: number;
}

export interface ModuleEngagementSummary {
  completed_days: number;
  total_days: number;
  rolling_score_pct: number;
  xp_earned: number;
  cefr_progress_pct: number;
  next_cefr_band: string | null;
  ready_to_advance: boolean;
}

export interface ModuleCheckResult {
  score_pct: number;
  ready_to_advance: boolean;
  current_cefr: string;
  next_cefr: string | null;
  at_ceiling: boolean;
}

export interface AdvanceCefrResponse {
  new_cefr: string;
  xp_earned: number;
}

// ==========================================
// 3. Day Response Types
// ==========================================

export interface ModuleDayResponse {
  id: string;
  day_number: number;
  topic: string | null;
  duration_hours: number | null;
  is_completed: boolean;
}

export interface DayProgressResponse {
  total_activities: number;
  completed_activities: number;
  progress_percentage: number;
  estimated_minutes_remaining: number;
}

// ==========================================
// 4. Activity Response Types
// ==========================================

export interface ModuleActivityListResponse {
  id: string;
  skill: string | null;
  activity_type: string;
  interaction_type: string | null;
  title: string | null;
  instruction: string | null;
  progress: Record<string, number> | null;
  duration_seconds: number | null;
  status: string;
}

export interface ActivityCompleteRequest {
  score?: number | null;
  passed?: boolean;
  response_data?: Record<string, any> | null;
}

export interface ActivityCompleteResponse {
  activity_id: string;
  user_id: string;
  completed: boolean;
  already_completed: boolean;
  score: number | null;
  passed: boolean;
  day_completed: boolean;
  xp_earned: number;
  module_check_result: ModuleCheckResult | null;
}

export interface ActivityQuestionResponse {
  id: string;
  question_text: string;
  question_type: string | null;
  interaction_type: string | null;
  options: Array<Record<string, any> | string> | null;
  correct_answer: string | null;
  complexity: string | null;
  criteria: Record<string, any> | string[] | null;
  content?: Record<string, any> | null;
  evaluation?: Record<string, any> | null;
  ui_config?: Record<string, any> | null;
  media_urls?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  is_placeholder: boolean;
  audio_url: string | null;
  scoring_rubric: Record<string, any> | null;
  cefr_level: string;
  order_index: number;
}

// ==========================================
// RTK Query progressionApi
// ==========================================

export const progressionApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── Progression ──
    getProgression: builder.query<ProgressionRead, void>({
      query: () => "/v1/progression",
      providesTags: ["Modules"],
    }),

    // ── Modules ──
    getModules: builder.query<ModuleResponse[], void>({
      query: () => "/v1/modules/",
      providesTags: ["Modules"],
    }),

    getModuleVariants: builder.query<ModuleVariantResponse[], string>({
      query: (moduleId) => `/v1/modules/${moduleId}/variants`,
      providesTags: ["Modules"],
    }),

    getModuleProgress: builder.query<ModuleProgressResponse, string>({
      query: (moduleId) => `/v1/modules/${moduleId}/progress`,
      providesTags: (_result, _error, id) => [{ type: "Modules" as const, id }],
    }),

    getModuleEngagement: builder.query<ModuleEngagementSummary, string>({
      query: (moduleId) => `/v1/modules/${moduleId}/engagement`,
      providesTags: (_result, _error, id) => [{ type: "Modules" as const, id }],
    }),

    evaluateModuleCheck: builder.mutation<ModuleCheckResult, string>({
      query: (moduleId) => ({
        url: `/v1/modules/${moduleId}/check`,
        method: "POST",
      }),
      invalidatesTags: ["Modules"],
    }),

    advanceCefr: builder.mutation<AdvanceCefrResponse, string>({
      query: (moduleId) => ({
        url: `/v1/modules/${moduleId}/advance-cefr`,
        method: "POST",
      }),
      invalidatesTags: ["Modules"],
    }),

    // ── Days ──
    getModuleDays: builder.query<ModuleDayResponse[], string>({
      query: (moduleId) => `/v1/modules/${moduleId}/days`,
      providesTags: ["Modules"],
    }),

    getDayProgress: builder.query<DayProgressResponse, string>({
      query: (dayId) => `/v1/modules/days/${dayId}/progress`,
      providesTags: (_result, _error, id) => [{ type: "Modules" as const, id }],
    }),

    // ── Activities ──
    getDayActivities: builder.query<ModuleActivityListResponse[], string>({
      query: (dayId) => `/v1/modules/days/${dayId}/activities`,
      providesTags: ["Modules"],
    }),

    getActivityQuestions: builder.query<ActivityQuestionResponse[], string>({
      query: (activityId) => `/v1/modules/activities/${activityId}/questions`,
      providesTags: (_result, _error, id) => [{ type: "Modules" as const, id }],
    }),

    completeActivity: builder.mutation<
      ActivityCompleteResponse,
      { activity_id: string; body: ActivityCompleteRequest }
    >({
      query: ({ activity_id, body }) => ({
        url: `/v1/modules/activities/${activity_id}/complete`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Modules"],
    }),
  }),
});

export const {
  useGetProgressionQuery,
  useLazyGetProgressionQuery,
  useGetModulesQuery,
  useLazyGetModulesQuery,
  useGetModuleVariantsQuery,
  useLazyGetModuleVariantsQuery,
  useGetModuleProgressQuery,
  useLazyGetModuleProgressQuery,
  useGetModuleEngagementQuery,
  useLazyGetModuleEngagementQuery,
  useEvaluateModuleCheckMutation,
  useAdvanceCefrMutation,
  useGetModuleDaysQuery,
  useLazyGetModuleDaysQuery,
  useGetDayProgressQuery,
  useLazyGetDayProgressQuery,
  useGetDayActivitiesQuery,
  useLazyGetDayActivitiesQuery,
  useGetActivityQuestionsQuery,
  useLazyGetActivityQuestionsQuery,
  useCompleteActivityMutation,
} = progressionApi;
