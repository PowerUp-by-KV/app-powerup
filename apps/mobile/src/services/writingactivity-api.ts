import { api } from "./api";

import { ActivityBase, ApiResponse } from "./types";

export const writingApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWritingActivity: builder.query<any, string>({
      query: (activityId) => `/modules/activities/${activityId}/questions`,
      transformResponse: (questions: any[]) => {
        return {
          id: questions[0]?.activity_id,
          scenario_name: "Writing Practice",
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question_text,
            description: "Write your response below.",
          })),
        };
      },
      providesTags: ["Results"],
    }),

    submitWritingActivity: builder.mutation<any, any>({
      // Real API: query: ({ activityId, answers }) => ({ url: `/api/v1/activities/${activityId}/submit`, method: "POST", body: { answers } }),
      queryFn: () => ({ data: { score: 90, feedback: "Clear and coherent response." } }),
      invalidatesTags: ["Results"],
    }),
  }),
});

export const { useGetWritingActivityQuery, useSubmitWritingActivityMutation } = writingApi;
