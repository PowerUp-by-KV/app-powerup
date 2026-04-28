import { api } from "./api";
import { VocabularyActivityData } from "./types";

export const vocabularyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVocabularyActivity: builder.query<VocabularyActivityData, string>({
      query: (id) => `/v1/modules/activities/${id}`,
      providesTags: ["Results"],
    }),

    submitVocabularyActivity: builder.mutation<
      unknown,
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
