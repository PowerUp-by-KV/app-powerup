import { api } from "./api";
import { MOCK_ACTIVITIES } from "@/constants/learning-data";
import { ActivityBase, VocabularyActivityData } from "./types";

export const vocabularyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVocabularyActivity: builder.query<VocabularyActivityData, string>({
      queryFn: (id) => {
        const activity = Object.values(MOCK_ACTIVITIES)
          .flat()
          .find((a) => a.id === id);
        return { data: activity as VocabularyActivityData };
      },
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
