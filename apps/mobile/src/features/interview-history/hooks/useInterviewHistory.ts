import { interviewApi as api } from "@/services/interviewApiSlice";
import type { SessionHistory } from "../types";

export const interviewHistoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInterviewHistory: builder.query<SessionHistory[], void>({
      query: () => "/v1/interview/history",
    }),
  }),
});

export const { useGetInterviewHistoryQuery } = interviewHistoryApi;
