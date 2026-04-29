import { api } from "./api";
import { SpeakingActivityData } from "./types";

export const speakingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSpeakingActivity: builder.query<SpeakingActivityData, string>({
      query: (id) => `/v1/modules/activities/${id}`,
      providesTags: ["Results"],
    }),

    submitSpeakingActivity: builder.mutation<unknown, { question_id: string; audio_file: Blob }>({
      query: (body) => {
        const formData = new FormData();
        formData.append("question_id", body.question_id);
        formData.append("audio_file", body.audio_file);

        return {
          url: "/activity/speaking/submit",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Results"],
    }),
  }),
});

export const { useGetSpeakingActivityQuery, useSubmitSpeakingActivityMutation } = speakingApi;
