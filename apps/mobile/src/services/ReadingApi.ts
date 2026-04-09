import { api } from "./api";
import {
  ApiResponse,
  ReadingPassage,
  ReadingQuestion,
  ReadingSubmitRequest,
  SubmitResponse,
} from "./types";
import { readingData as MOCK_READING_DATA } from "@/constants/readingData";

const readingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReadingPassages: builder.query<ReadingPassage[], void>({
      query: () => "/api/reading/passages",
      transformResponse: (response: ApiResponse<ReadingPassage[]>) => {
        return response?.success ? response.data : (MOCK_READING_DATA as any);
      },
      providesTags: ["reading"],
    }),

    getReadingQuestions: builder.query<ReadingQuestion[], string>({
      query: (passageId) => `/api/reading/questions?passageId=${passageId}`,
      transformResponse: (response: ApiResponse<ReadingQuestion[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, passageId) => [{ type: "reading", id: `QS-${passageId}` }],
    }),

    submitReading: builder.mutation<SubmitResponse, ReadingSubmitRequest>({
      query: (body) => ({
        url: "/api/reading/submit",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitResponse>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      invalidatesTags: ["reading"],
    }),
  }),
});

export const { useGetReadingPassagesQuery, useGetReadingQuestionsQuery, useSubmitReadingMutation } =
  readingApi;
