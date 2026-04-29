import { api } from "./api";
import { WritingActivityData } from "./types";

export const writingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWritingActivity: builder.query<WritingActivityData, string>({
      query: (id) => `/v1/modules/activities/${id}`,
      providesTags: ["Results"],
    }),

    submitWritingActivity: builder.mutation<unknown, unknown>({
      queryFn: () => ({ data: { score: 90, feedback: "Clear and coherent response." } }),
      invalidatesTags: ["Results"],
    }),
  }),
});

export const { useGetWritingActivityQuery, useSubmitWritingActivityMutation } = writingApi;
