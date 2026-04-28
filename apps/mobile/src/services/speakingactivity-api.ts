import { api } from "./api";
import { MOCK_ACTIVITIES } from "@/constants/learning-data";
import { ActivityBase, SpeakingActivityData } from "./types";

export const speakingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSpeakingActivity: builder.query<SpeakingActivityData, string>({
      queryFn: (id) => {
        const activity = Object.values(MOCK_ACTIVITIES)
          .flat()
          .find((a) => a.id === id);
        return { data: activity as SpeakingActivityData };
      },
      providesTags: ["Results"],
    }),

    submitSpeakingActivity: builder.mutation<unknown, { question_id: string; audio_file: unknown }>(
      {
        query: (body) => {
          const formData = new FormData();
          formData.append("question_id", body.question_id);
          formData.append("audio_file", body.audio_file as any);

          return {
            url: "/activity/speaking/submit",
            method: "POST",
            body: formData,
          };
        },
        invalidatesTags: ["Results"],
      },
    ),
  }),
});

export const { useGetSpeakingActivityQuery, useSubmitSpeakingActivityMutation } = speakingApi;
