import { api } from "./api";
import {
  ApiResponse,
  GrammarTopic,
  GrammarDefinition,
  GrammarQuestion,
  GrammarSubmitRequest,
  SubmitResponse,
  GrammarActivityData,
} from "./types";

export const grammarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGrammarTopics: builder.query<GrammarTopic[], void>({
      query: () => "/grammar/topics",
      transformResponse: (response: ApiResponse<GrammarTopic[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: ["Grammar"],
    }),

    getGrammarDefinition: builder.query<GrammarDefinition, string>({
      query: (topicId) => ({
        url: "/grammar/definition",
        params: { topicId },
      }),
      transformResponse: (response: ApiResponse<GrammarDefinition>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, topicId) => [{ type: "Grammar", id: `DEF-${topicId}` }],
    }),

    getGrammarQuestions: builder.query<GrammarQuestion[], string>({
      query: (topicId) => ({
        url: "/grammar/questions",
        params: { topicId },
      }),
      transformResponse: (response: ApiResponse<GrammarQuestion[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, topicId) => [{ type: "Grammar", id: `QS-${topicId}` }],
    }),

    submitGrammar: builder.mutation<SubmitResponse, GrammarSubmitRequest>({
      query: (body) => ({
        url: "/grammar/submit",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitResponse>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      invalidatesTags: ["Grammar", "Results"],
    }),

    // Lesson-specific endpoints (migrated from activity-api)
    getGrammarActivity: builder.query<GrammarActivityData, string>({
      query: (id) => `/v1/modules/activities/${id}`,
      providesTags: ["Grammar"],
    }),

    submitGrammarActivity: builder.mutation<unknown, unknown>({
      queryFn: () => ({ data: { score: 100, feedback: "Grammatically flawless!" } }),
      invalidatesTags: ["Grammar", "Results"],
    }),
  }),
});

export const {
  useGetGrammarTopicsQuery,
  useGetGrammarDefinitionQuery,
  useGetGrammarQuestionsQuery,
  useSubmitGrammarMutation,
  useGetGrammarActivityQuery,
  useSubmitGrammarActivityMutation,
} = grammarApi;
