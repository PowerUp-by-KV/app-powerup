import { api } from "./api";
import {
  ApiResponse,
  VerbalQuestion,
  VerbalDefinition,
  VerbalSubmitRequest,
  SubmitResponse,
} from "./types";
import { speakingPrompts as MOCK_VERBAL_QUESTIONS } from "@/constants/verbalData";

const verbalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVerbalQuestions: builder.query<VerbalQuestion[], void>({
      query: () => "/api/skills/questions",
      transformResponse: (response: ApiResponse<VerbalQuestion[]>) => {
        return response?.success ? response.data : (MOCK_VERBAL_QUESTIONS as any);
      },
      providesTags: ["skills"],
    }),

    getVerbalDefinition: builder.query<VerbalDefinition, string>({
      query: (questionId) => `/api/skills/definition?questionId=${questionId}`,
      transformResponse: (response: ApiResponse<VerbalDefinition>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, questionId) => [{ type: "skills", id: `DEF-${questionId}` }],
    }),

    submitVerbal: builder.mutation<SubmitResponse, VerbalSubmitRequest>({
      query: (body) => ({
        url: "/api/skills/submit",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitResponse>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      invalidatesTags: ["skills"],
    }),
  }),
});

export const { useGetVerbalQuestionsQuery, useGetVerbalDefinitionQuery, useSubmitVerbalMutation } =
  verbalApi;
