import { api } from "./api";
import {
  ApiResponse,
  ReadingPassage,
  ReadingQuestion,
  ReadingSubmitRequest,
  SubmitResponse,
  ActivityBase,
} from "./types";

export const readingApi = api.injectEndpoints({
  overrideExisting: true,
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
    getReadingActivity: builder.query<any, string>({
      query: (activityId) => `/modules/activities/${activityId}/questions`,
      transformResponse: (questions: any[]) => {
        return {
          id: questions[0]?.activity_id,
          scenario_name: "Reading Practice",
          paragraph:
            "Please read the questions and select the best answer based on your understanding.",
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question_text,
            options: q.options?.map((o: any) => o.text) || [],
            answer: q.correct_answer,
          })),
        };
      },
      providesTags: ["Reading"],
    }),

    submitReadingActivity: builder.mutation<
      any,
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
