import { api } from "./api";
import {
  ApiResponse,
  ListeningAudioWithQuestions,
  ListeningQuestion,
  ListeningSubmitRequest,
  SubmitResponse,
  ActivityBase,
} from "./types";

export const listeningApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getListeningLessons: builder.query<ListeningAudioWithQuestions[], void>({
      query: () => "/listening/lessons",
      transformResponse: (response: ApiResponse<ListeningAudioWithQuestions[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: ["Listening"],
    }),

    getListeningQuestions: builder.query<ListeningQuestion[], string>({
      query: (audioId) => ({
        url: "/listening/questions",
        params: { audioId },
      }),
      transformResponse: (response: ApiResponse<ListeningQuestion[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, audioId) => [{ type: "Listening", id: `QS-${audioId}` }],
    }),

    submitListening: builder.mutation<SubmitResponse, ListeningSubmitRequest>({
      query: (body) => ({
        url: "/listening/submit",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitResponse>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      invalidatesTags: ["Listening", "Results"],
    }),

    // Lesson-specific endpoints (migrated from activity-api)
    getListeningActivity: builder.query<any, string>({
      query: (activityId) => `/modules/activities/${activityId}/questions`,
      transformResponse: (questions: any[]) => {
        // Map backend questions to the structure expected by the UI
        return {
          id: questions[0]?.activity_id,
          scenario_name: "Listening Practice",
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question_text,
            options: q.options?.map((o: any) => o.text) || [],
            answer: q.correct_answer,
            audio_url: q.audio_url,
          })),
        };
      },
      providesTags: ["Listening"],
    }),

    submitListeningActivity: builder.mutation<
      any,
      { answers: Array<{ question_id: string; selected_option_id?: string; answer_text?: string }> }
    >({
      query: (body) => ({
        url: "/activity/listening/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Listening", "Results"],
    }),
  }),
});

export const {
  useGetListeningLessonsQuery,
  useGetListeningQuestionsQuery,
  useSubmitListeningMutation,
  useGetListeningActivityQuery,
  useSubmitListeningActivityMutation,
} = listeningApi;
