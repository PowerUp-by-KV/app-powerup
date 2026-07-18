import type {
  Activity,
  ActivityQuestion,
  ActivitySubmitResponse,
  Module,
  ModuleDay,
  ModuleVariant,
} from "@powerup/shared";

import { api, API_BASE_URL, refreshAccessToken } from "./api";
import { getAuthSession } from "./auth-storage";

export interface PersonalizedModuleItem {
  id: string;
  module_no: number;
  title: string;
  variant_id: string | null;
  is_unlocked: boolean;
}

export interface PersonalizedPathResponse {
  cefr_band: string;
  modules: PersonalizedModuleItem[];
}

export interface ModuleProgressResponse {
  total_activities: number;
  completed_activities: number;
  progress_percentage: number;
  current_day: number;
}

export interface DayProgressResponse {
  total_activities: number;
  completed_activities: number;
  progress_percentage: number;
  estimated_minutes_remaining: number;
}

export interface ModuleCheckResult {
  score_pct: number;
  ready_to_advance: boolean;
  current_cefr: string;
  next_cefr: string | null;
  at_ceiling: boolean;
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

export interface ActivityCompleteRequest {
  score?: number | null;
  passed?: boolean;
  response_data?: Record<string, unknown> | null;
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

export interface AdvanceCefrResponse {
  new_cefr: string;
  xp_earned: number;
}

export interface SubmitAnswerArgs {
  activity_id: string;
  answers: Array<{ question_id: string; answer: string; audio_url?: string }>;
}

export interface WritingSubmitArgs {
  question_id: string;
  response_text: string;
}

export interface WritingResultRead {
  score: number;
  cefr_level: string;
  feedback: string;
  grammar_errors: string[];
  passed: boolean;
}

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

export interface ActivityResultDetail {
  activity_id: string;
  activity_name: string;
  evaluation_status: string | null;
  passed: boolean;
  score: number | null;
  feedback: string | null;
  score_breakdown: Record<string, any> | null;
  xp_earned: number;
  response_id: string | null;
  skill_type: string | null;
  activity_type: string | null;
}

export interface DailyResultsResponse {
  day_id: string;
  all_evaluations_completed: boolean;
  all_activities_passed: boolean;
  failed_count: number;
  pending_count: number;
  total_day_xp: number;
  current_total_xp: number;
  activities: ActivityResultDetail[];
}

export interface AdvanceDayResponse {
  advanced: boolean;
  new_day: number;
  xp_bonus: number;
  new_total_xp: number;
}

export const moduleApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPersonalizedPath: builder.query<PersonalizedPathResponse, void>({
      query: () => "/v1/learning-path/personalized",
      providesTags: ["Modules"],
    }),

    getProgression: builder.query<ProgressionRead, void>({
      query: () => "/v1/progression",
      providesTags: ["Modules"],
    }),

    getModuleProgress: builder.query<ModuleProgressResponse, string>({
      query: (moduleId) => `/v1/modules/${moduleId}/progress`,
      providesTags: (_result, _error, id) => [{ type: "Modules" as const, id }],
    }),

    getModules: builder.query<Module[], void>({
      query: () => "/v1/modules/",
      providesTags: ["Modules"],
    }),

    getModuleVariants: builder.query<ModuleVariant[], string>({
      query: (moduleId) => `/v1/modules/${moduleId}/variants`,
      providesTags: ["Modules"],
    }),

    getModuleDays: builder.query<ModuleDay[], string>({
      query: (moduleId) => `/v1/modules/${moduleId}/days`,
      providesTags: ["Modules"],
    }),

    // One request for the whole learning path. Fetching each module's days separately meant
    // a round trip per module (12+ on My Learning) every time the screen regained focus.
    getModuleDaysBulk: builder.query<Record<string, ModuleDay[]>, string[]>({
      query: (moduleIds) => ({
        // Send repeated params (module_ids=a&module_ids=b), which is what FastAPI's list[…]
        // query expects. The default array serialization is comma-joined, which the API
        // rejected with 422 — collapsing the whole My Learning path to locked placeholders.
        url:
          "/v1/modules/days/bulk" +
          (moduleIds.length
            ? `?${moduleIds.map((id) => `module_ids=${encodeURIComponent(id)}`).join("&")}`
            : ""),
      }),
      transformResponse: (response: { days_by_module: Record<string, ModuleDay[]> }) =>
        response.days_by_module,
      providesTags: ["Modules"],
    }),

    getDayActivities: builder.query<Activity[], string>({
      query: (dayId) => `/v1/modules/days/${dayId}/activities`,
      providesTags: ["Modules"],
    }),

    getActivityQuestions: builder.query<ActivityQuestion[], string>({
      query: (activityId) => `/v1/modules/activities/${activityId}/questions`,
      providesTags: (_result, _error, id) => [{ type: "Modules" as const, id }],
    }),

    submitReadingAnswer: builder.mutation<ActivitySubmitResponse, SubmitAnswerArgs>({
      query: (body) => ({ url: "/v1/activity/reading/submit", method: "POST", body }),
    }),

    submitListeningAnswer: builder.mutation<ActivitySubmitResponse, SubmitAnswerArgs>({
      query: (body) => ({ url: "/v1/activity/listening/submit", method: "POST", body }),
    }),

    submitVocabularyAnswer: builder.mutation<ActivitySubmitResponse, SubmitAnswerArgs>({
      query: (body) => ({ url: "/v1/activity/vocabulary/submit", method: "POST", body }),
    }),

    submitWritingAnswer: builder.mutation<WritingResultRead, WritingSubmitArgs>({
      query: (body) => ({ url: "/v1/activity/writing/submit", method: "POST", body }),
    }),

    submitSpeakingAnswer: builder.mutation<ActivitySubmitResponse, FormData>({
      queryFn: async (formData) => {
        try {
          const session = await getAuthSession();
          const headers: Record<string, string> = {};
          if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
          }
          let response = await fetch(`${API_BASE_URL}/v1/activity/speaking/submit`, {
            method: "POST",
            headers,
            body: formData,
          });

          if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
              headers["Authorization"] = `Bearer ${newToken}`;
              response = await fetch(`${API_BASE_URL}/v1/activity/speaking/submit`, {
                method: "POST",
                headers,
                body: formData,
              });
            }
          }

          if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: "Submit failed" }));
            return { error: { status: response.status, data: err } };
          }
          const data = (await response.json()) as ActivitySubmitResponse;
          return { data };
        } catch (err) {
          return { error: { status: "FETCH_ERROR" as const, error: String(err) } };
        }
      },
    }),

    // ── Day-progression loop ─────────────────────────────────────────────
    // Call this AFTER the skill-specific submit returns. It records the
    // pass/score on ModuleActivity, auto-advances current_day when every
    // activity in the day passes, and fires module-check scoring on day 12.
    completeActivity: builder.mutation<
      ActivityCompleteResponse,
      { activity_id: string; body: ActivityCompleteRequest }
    >({
      query: ({ activity_id, body }) => ({
        url: `/v1/modules/activities/${activity_id}/complete`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Modules", "Auth", "Leaderboard"],
    }),

    getDayProgress: builder.query<DayProgressResponse, string>({
      query: (dayId) => `/v1/modules/days/${dayId}/progress`,
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
      invalidatesTags: ["Modules", "Auth", "Leaderboard"],
    }),

    advanceCefr: builder.mutation<AdvanceCefrResponse, string>({
      query: (moduleId) => ({
        url: `/v1/modules/${moduleId}/advance-cefr`,
        method: "POST",
      }),
      invalidatesTags: ["Modules", "Auth", "Leaderboard"],
    }),

    getDayResults: builder.query<DailyResultsResponse, string>({
      query: (dayId) => `/v1/modules/days/${dayId}/results`,
      providesTags: ["Modules"],
    }),

    advanceDay: builder.mutation<AdvanceDayResponse, string>({
      query: (dayId) => ({
        url: `/v1/modules/days/${dayId}/advance`,
        method: "POST",
      }),
      invalidatesTags: ["Modules", "Auth", "Leaderboard"],
    }),
  }),
});

export const {
  useGetPersonalizedPathQuery,
  useGetProgressionQuery,
  useLazyGetProgressionQuery,
  useGetModuleProgressQuery,
  useGetModulesQuery,
  useGetModuleVariantsQuery,
  useGetModuleDaysQuery,
  useLazyGetModuleDaysQuery,
  useLazyGetModuleDaysBulkQuery,
  useGetDayActivitiesQuery,
  useGetActivityQuestionsQuery,
  useSubmitReadingAnswerMutation,
  useSubmitListeningAnswerMutation,
  useSubmitVocabularyAnswerMutation,
  useSubmitWritingAnswerMutation,
  useSubmitSpeakingAnswerMutation,
  useCompleteActivityMutation,
  useGetDayProgressQuery,
  useGetModuleEngagementQuery,
  useEvaluateModuleCheckMutation,
  useAdvanceCefrMutation,
  useGetDayResultsQuery,
  useLazyGetDayResultsQuery,
  useAdvanceDayMutation,
} = moduleApi;
