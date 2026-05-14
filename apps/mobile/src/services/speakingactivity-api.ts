import { api } from "./api";

import { ActivityBase, ApiResponse } from "./types";

export const speakingApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSpeakingActivity: builder.query<any, string>({
      query: (activityId) => `/modules/activities/${activityId}/questions`,
      transformResponse: (questions: any[]) => {
        return {
          id: questions[0]?.activity_id,
          scenario_name: "Speaking Practice",
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question_text,
            audio_url: q.audio_url,
          })),
        };
      },
      providesTags: ["Results"],
    }),

    submitSpeakingActivity: builder.mutation<
      ApiResponse<{ score: number; feedback: string; analysis: string[] }>,
      { question_id: string; audio_base64: string }
    >({
      // Real API: query: (body) => ({ url: "/activity/speaking/submit", method: "POST", body }),
      queryFn: () => ({
        data: {
          success: true,
          message: "Mock success",
          data: {
            score: 92,
            feedback: "Excellent work! Your pronunciation was very clear.",
            analysis: ["Fluency: 95%", "Pronunciation: 90%", "Grammar: 92%"],
          },
        },
      }),
      invalidatesTags: ["Results"],
    }),
  }),
});

export const { useGetSpeakingActivityQuery, useSubmitSpeakingActivityMutation } = speakingApi;
