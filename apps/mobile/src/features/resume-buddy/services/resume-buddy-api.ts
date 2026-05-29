import { api } from "@/services/api";
import { ResumeBuddyResponse } from "../types";

export const resumeBuddyApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    analyzeResume: builder.mutation<ResumeBuddyResponse, FormData>({
      query: (formData) => ({
        url: "/v1/resume/buddy/analyze",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useAnalyzeResumeMutation } = resumeBuddyApi;
