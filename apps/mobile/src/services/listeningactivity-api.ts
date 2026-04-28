import { api } from "./api";
import {
  ApiResponse,
  ListeningAudioWithQuestions,
  ListeningQuestion,
  ListeningSubmitRequest,
  SubmitResponse,
  ActivityBase,
  ListeningActivityData,
} from "./types";
import { MOCK_ACTIVITIES } from "@/constants/learning-data";

export const listeningApi = api.injectEndpoints({
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
    getListeningActivity: builder.query<ListeningActivityData, string>({
      queryFn: (id) => {
        const activity = Object.values(MOCK_ACTIVITIES)
          .flat()
          .find((a) => a.id === id);
        return { data: activity as ListeningActivityData };
      },
      providesTags: ["Listening"],
    }),

    submitListeningActivity: builder.mutation<
      unknown,
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
