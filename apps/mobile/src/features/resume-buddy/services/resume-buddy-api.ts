import { api } from "@/services/api";
import type {
  ResumeBuddyAnalyzeRequest,
  ResumeBuddyResponse,
  ResumeBuddyHistoryResponse,
} from "../types";

export const resumeBuddyApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    analyzeResume: builder.mutation<ResumeBuddyResponse, ResumeBuddyAnalyzeRequest>({
      query: (body) => ({
        url: "/v1/resume/buddy/analyze",
        method: "POST",
        body,
      }),
    }),

    getResumeBuddyHistory: builder.query<ResumeBuddyHistoryResponse, void>({
      query: () => ({
        url: "/v1/resume/buddy/history",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useAnalyzeResumeMutation,
  useGetResumeBuddyHistoryQuery,
  useLazyGetResumeBuddyHistoryQuery,
} = resumeBuddyApi;
