import { api } from "./api";
import { MOCK_ACTIVITIES } from "@/constants/learning-data";
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
    getDayActivities: builder.query<ActivityBase[], any>({
      // Backend Endpoint: query: ({ dayId }) => `/api/v1/modules/days/${dayId}/activities`,
      queryFn: ({ moduleId, dayNo }) => {
        // Keeping mock logic for now to ensure app keeps working
        const cleanModuleId = moduleId?.includes("placeholder-")
          ? moduleId.split("-")[1]
          : moduleId?.replace("m", "");

        const key = `placeholder-${cleanModuleId}_${dayNo}`;
        const activities = MOCK_ACTIVITIES[key] || [];
        return { data: activities };
      },
      providesTags: ["Results"],
    }),

    getActivityQuestions: builder.query<unknown[], string>({
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
