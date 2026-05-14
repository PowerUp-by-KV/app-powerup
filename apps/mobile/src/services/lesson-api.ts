import { api } from "./api";
import { ApiResponse, ActivityBase } from "./types";

export interface GetDayActivitiesRequest {
  moduleId: string;
  dayNo: number;
  cefr_level: string;
}

export interface CompleteDayRequest {
  moduleId: string;
  dayNo: number;
  scores: Record<string, number>;
}

export const lessonApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDayActivities: builder.query<ActivityBase[], string | GetDayActivitiesRequest>({
      query: (arg) => {
        if (typeof arg === "string") return `/modules/days/${arg}/activities`;
        return `/modules/days/${arg.moduleId}/activities`;
      },
      transformResponse: (response: any[]) => {
        return response.map((a: any) => ({
          ...a,
          type: a.skill_type ? a.skill_type.toLowerCase() : "unknown",
          scenario_name: a.scenario_name || "Daily Lesson",
        }));
      },
      providesTags: ["Results"],
    }),

    getActivityQuestions: builder.query<any[], string>({
      query: (activityId) => `/api/v1/modules/activities/${activityId}/questions`,
    }),

    completeDay: builder.mutation<ApiResponse<void>, CompleteDayRequest>({
      query: (body) => ({
        url: `/api/v1/modules/${body.moduleId}/days/${body.dayNo}/complete`,
        method: "POST",
        body: body.scores,
      }),
      invalidatesTags: ["Results"],
    }),
  }),
});

export const { useGetDayActivitiesQuery, useGetActivityQuestionsQuery, useCompleteDayMutation } =
  lessonApi;
