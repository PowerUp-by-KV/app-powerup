import type {
  Activity,
  ActivityQuestion,
  ActivitySubmitResponse,
  Module,
  ModuleDay,
  ModuleVariant,
} from "@powerup/shared";

import { api } from "./api";

export interface SubmitAnswerArgs {
  activity_id: string;
  answers: Array<{ question_id: string; answer: string; audio_url?: string }>;
}

export const moduleApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
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

    submitWritingAnswer: builder.mutation<ActivitySubmitResponse, SubmitAnswerArgs>({
      query: (body) => ({ url: "/v1/activity/writing/submit", method: "POST", body }),
    }),

    submitSpeakingAnswer: builder.mutation<ActivitySubmitResponse, FormData>({
      query: (formData) => ({
        url: "/v1/activity/speaking/submit",
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — RN sets multipart boundary automatically.
      }),
    }),
  }),
});

export const {
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
} = moduleApi;
