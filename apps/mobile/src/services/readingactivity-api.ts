import { api } from "./api";
import {
  ApiResponse,
  ReadingPassage,
  ReadingQuestion,
  ReadingSubmitRequest,
  SubmitResponse,
  ReadingActivityData,
} from "./types";

export const readingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReadingPassages: builder.query<ReadingPassage[], void>({
      query: () => "/reading/passages",
      transformResponse: (response: ApiResponse<ReadingPassage[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: ["Reading"],
    }),

    getReadingQuestions: builder.query<ReadingQuestion[], string>({
      query: (passageId) => ({
        url: "/reading/questions",
        params: { passageId },
      }),
      transformResponse: (response: ApiResponse<ReadingQuestion[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, passageId) => [{ type: "Reading", id: `QS-${passageId}` }],
    }),

    submitReading: builder.mutation<SubmitResponse, ReadingSubmitRequest>({
      query: (body) => ({
        url: "/reading/submit",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitResponse>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      invalidatesTags: ["Reading", "Results"],
    }),

    // Lesson-specific endpoints (migrated from activity-api)
    getReadingActivity: builder.query<ReadingActivityData, string>({
      query: (id) => `/v1/modules/activities/${id}`,
      providesTags: ["Reading"],
    }),

    submitReadingActivity: builder.mutation<
      unknown,
      { answers: Array<{ question_id: string; selected_option_id?: string; answer_text?: string }> }
    >({
      query: (body) => ({
        url: "/activity/reading/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reading", "Results"],
    }),
  }),
});

export const {
  useGetReadingPassagesQuery,
  useGetReadingQuestionsQuery,
  useSubmitReadingMutation,
  useGetReadingActivityQuery,
  useSubmitReadingActivityMutation,
} = readingApi;
