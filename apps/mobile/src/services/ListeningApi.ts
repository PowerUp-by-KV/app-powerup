import { api } from "./api";
import {
  ApiResponse,
  ListeningAudio,
  ListeningQuestion,
  ListeningSubmitRequest,
  SubmitResponse,
} from "./types";
import { listeningData as MOCK_LISTENING_AUDIO } from "@/constants/listeningData";

const listeningApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getListeningAudio: builder.query<ListeningAudio[], void>({
      query: () => "/api/listening/audio",
      transformResponse: (response: ApiResponse<ListeningAudio[]>) => {
        return response?.success ? response.data : (MOCK_LISTENING_AUDIO as any);
      },
      providesTags: ["listening"],
    }),

    getListeningQuestions: builder.query<ListeningQuestion[], string>({
      query: (audioId) => `/api/listening/questions?audioId=${audioId}`,
      transformResponse: (response: ApiResponse<ListeningQuestion[]>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, audioId) => [{ type: "listening", id: `QS-${audioId}` }],
    }),

    submitListening: builder.mutation<SubmitResponse, ListeningSubmitRequest>({
      query: (body) => ({
        url: "/api/listening/submit",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitResponse>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      invalidatesTags: ["listening"],
    }),
  }),
});

export const {
  useGetListeningAudioQuery,
  useGetListeningQuestionsQuery,
  useSubmitListeningMutation,
} = listeningApi;
