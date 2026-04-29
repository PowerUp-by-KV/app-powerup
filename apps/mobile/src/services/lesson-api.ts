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
  endpoints: (builder) => ({
    getDayActivities: builder.query<ActivityBase[], GetDayActivitiesRequest>({
      // Backend Endpoint: query: ({ dayId }) => `/v1/modules/days/${dayId}/activities`,
      query: ({ moduleId, dayNo }) => `/v1/modules/${moduleId}/days/${dayNo}/activities`,
      providesTags: ["Results"],
    }),

    getActivityQuestions: builder.query<unknown[], string>({
      query: (activityId) => `/v1/modules/activities/${activityId}/questions`,
    }),

    completeDay: builder.mutation<ApiResponse<void>, CompleteDayRequest>({
      query: (body) => ({
        url: `/v1/modules/${body.moduleId}/days/${body.dayNo}/complete`,
        method: "POST",
        body: body.scores,
      }),
      invalidatesTags: ["Results"],
    }),
  }),
});

export const { useGetDayActivitiesQuery, useGetActivityQuestionsQuery, useCompleteDayMutation } =
  lessonApi;
