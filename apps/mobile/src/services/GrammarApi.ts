import { api } from "./api";
import {
  ApiResponse,
  GrammarTopic,
  GrammarDefinition,
  GrammarQuestion,
  GrammarSubmitRequest,
  SubmitResponse,
} from "./types";
import { grammarTopics as MOCK_GRAMMAR_TOPICS } from "@/constants/grammarData";

const grammarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGrammarTopics: builder.query<GrammarTopic[], void>({
      query: () => "/api/grammar/topics",
      transformResponse: (response: ApiResponse<GrammarTopic[]>) => {
        return response?.success ? response.data : (MOCK_GRAMMAR_TOPICS as any);
      },
      providesTags: ["grammar"],
    }),

    getGrammarDefinition: builder.query<GrammarDefinition, string>({
      query: (topicId) => `/api/grammar/definition?topicId=${topicId}`,
      transformResponse: (response: ApiResponse<GrammarDefinition>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, topicId) => [{ type: "grammar", id: `DEF-${topicId}` }],
    }),

    getGrammarQuestions: builder.query<GrammarQuestion[], string>({
      query: (topicId) => `/api/grammar/questions?topicId=${topicId}`,
      transformResponse: (response: ApiResponse<GrammarQuestion[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, topicId) => [{ type: "grammar", id: `QS-${topicId}` }],
    }),

    submitGrammar: builder.mutation<SubmitResponse, GrammarSubmitRequest>({
      query: (body) => ({
        url: "/api/grammar/submit",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitResponse>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      invalidatesTags: ["grammar"],
    }),
  }),
});

export const {
  useGetGrammarTopicsQuery,
  useGetGrammarDefinitionQuery,
  useGetGrammarQuestionsQuery,
  useSubmitGrammarMutation,
} = grammarApi;
