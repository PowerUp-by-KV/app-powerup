import { api } from "./api";

import { ActivityBase, ApiResponse } from "./types";

export const vocabularyApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getVocabularyActivity: builder.query<any, string>({
      query: (activityId) => `/modules/activities/${activityId}/questions`,
      transformResponse: (questions: any[]) => {
        return {
          id: questions[0]?.activity_id,
          scenario_name: "Vocabulary Practice",
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question_text,
            options: q.options?.map((o: any) => o.text) || [],
            answer: q.correct_answer,
          })),
        };
      },
      providesTags: ["Results"],
    }),

    submitVocabularyActivity: builder.mutation<
      any,
      { answers: Array<{ question_id: string; selected_option_id?: string; answer_text?: string }> }
    >({
      query: (body) => ({
        url: "/activity/vocabulary/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Results"],
    }),
  }),
});

export const { useGetVocabularyActivityQuery, useSubmitVocabularyActivityMutation } = vocabularyApi;
