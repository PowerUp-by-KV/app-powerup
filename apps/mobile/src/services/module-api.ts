import type {
  Activity,
  ActivityQuestion,
  ActivitySubmitResponse,
  Module,
  ModuleDay,
  ModuleVariant,
} from "@powerup/shared";

import { api, API_BASE_URL } from "./api";
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

export const moduleApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getPersonalizedPath: builder.query<PersonalizedPathResponse, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        const result = await fetchWithBaseQuery("/v1/progression");
        if (result.error) {
          return { error: result.error };
        }
        const data = result.data as any;
        const modules = (data?.unlocked_modules || []).map((m: any) => ({
          id: m.module_id,
          module_no: m.module_no,
          title: m.title,
          variant_id: null,
          is_unlocked: !m.locked,
        }));
        return {
          data: {
            cefr_band: data?.cefr_level || "B1-B2",
            modules,
          },
        };
      },
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

    // queryFn + native fetch: same reason as assessment audio upload — fetchBaseQuery
    // serialises {uri,name,type} to "[object Object]"; native fetch handles it correctly.
    submitSpeakingAnswer: builder.mutation<ActivitySubmitResponse, FormData>({
      queryFn: async (formData) => {
        try {
          const session = await getAuthSession();
          const headers: Record<string, string> = {
            "X-Tunnel-Skip-AntiPhishing-Page": "true",
          };
          if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
          }
          const response = await fetch(`${API_BASE_URL}/v1/activity/speaking/submit`, {
            method: "POST",
            headers,
            body: formData,
          });
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
      invalidatesTags: ["Modules"],
    }),

    getDayProgress: builder.query<DayProgressResponse, string>({
      query: (dayId) => `/v1/modules/days/${dayId}/progress`,
      providesTags: (_result, _error, id) => [{ type: "Modules" as const, id }],
    }),

    getModuleEngagement: builder.query<ModuleEngagementSummary, string>({
      queryFn: async (moduleId, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        const res = await fetchWithBaseQuery(`/v1/modules/${moduleId}/engagement`);
        if (!res.error && res.data) {
          return { data: res.data as ModuleEngagementSummary };
        }
        const progRes = await fetchWithBaseQuery(`/v1/modules/${moduleId}/progress`);
        const prog = (progRes.data || {
          completed_activities: 0,
          total_activities: 10,
          progress_percentage: 0,
          current_day: 1,
        }) as any;
        return {
          data: {
            completed_days: prog.current_day ? prog.current_day - 1 : 0,
            total_days: 12,
            rolling_score_pct: prog.progress_percentage || 0,
            xp_earned: prog.completed_activities * 10,
            cefr_progress_pct: prog.progress_percentage || 0,
            next_cefr_band: null,
            ready_to_advance: false,
          },
        };
      },
      providesTags: (_result, _error, id) => [{ type: "Modules" as const, id }],
    }),

    evaluateModuleCheck: builder.mutation<ModuleCheckResult, string>({
      queryFn: async (moduleId, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        const res = await fetchWithBaseQuery({
          url: `/v1/modules/${moduleId}/check`,
          method: "POST",
        });
        if (res.error) {
          return { error: res.error };
        }
        return { data: res.data as ModuleCheckResult };
      },
      invalidatesTags: ["Modules"],
    }),

    advanceCefr: builder.mutation<AdvanceCefrResponse, string>({
      queryFn: async (moduleId, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        const res = await fetchWithBaseQuery({
          url: `/v1/modules/${moduleId}/advance-cefr`,
          method: "POST",
        });
        if (res.error) {
          return { error: res.error };
        }
        return { data: res.data as AdvanceCefrResponse };
      },
      invalidatesTags: ["Modules"],
    }),
  }),
});

export const {
  useGetPersonalizedPathQuery,
  useGetModuleProgressQuery,
  useGetModulesQuery,
  useGetModuleVariantsQuery,
  useGetModuleDaysQuery,
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
} = moduleApi;
