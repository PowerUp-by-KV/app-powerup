import { api } from "./api";
import {
  ApiResponse,
  GrammarTopic,
  GrammarDefinition,
  GrammarQuestion,
  GrammarSubmitRequest,
  SubmitResponse,
  ActivityBase,
} from "./types";

export const grammarApi = api.injectEndpoints({
  overrideExisting: true,
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
    getGrammarActivity: builder.query<any, string>({
      query: (activityId) => `/modules/activities/${activityId}/questions`,
      transformResponse: (questions: any[]) => {
        return {
          id: questions[0]?.activity_id,
          scenario_name: "Grammar Practice",
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question_text,
            options: q.options?.map((o: any) => o.text) || [],
            answer: q.correct_answer,
          })),
        };
      },
      providesTags: ["Grammar"],
    }),

    submitGrammarActivity: builder.mutation<any, any>({
      // Real API: query: ({ activityId, answers }) => ({ url: `/api/v1/activities/${activityId}/submit`, method: "POST", body: { answers } }),
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
