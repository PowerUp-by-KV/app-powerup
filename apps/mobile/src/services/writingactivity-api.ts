import { api } from "./api";
import { MOCK_ACTIVITIES } from "@/constants/learning-data";
import { ActivityBase, WritingActivityData } from "./types";

export const writingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWritingActivity: builder.query<WritingActivityData, string>({
      queryFn: (id) => {
        const activity = Object.values(MOCK_ACTIVITIES)
          .flat()
          .find((a) => a.id === id);
        return { data: activity as WritingActivityData };
      },
      providesTags: ["Results"],
    }),

    submitWritingActivity: builder.mutation<unknown, unknown>({
      queryFn: () => ({ data: { score: 90, feedback: "Clear and coherent response." } }),
      invalidatesTags: ["Results"],
    }),
  }),
});

export const { useGetWritingActivityQuery, useSubmitWritingActivityMutation } = writingApi;
