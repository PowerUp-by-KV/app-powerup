import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ResumeParsedData } from "@app-powerup/shared/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // TODO: Attach auth token from secure storage
      return headers;
    },
  }),
  tagTypes: ["Resume"],
  endpoints: (builder) => ({
    // Upload Resume PDF
    uploadResume: builder.mutation<{ data: ResumeParsedData; message: string }, FormData>({
      query: (formData) => ({
        url: "/v1/resume/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Resume"],
    }),

    // Get Resume by User ID
    getResume: builder.query<ResumeParsedData, string>({
      query: (userId) => `/v1/resume/${userId}`,
      providesTags: ["Resume"],
    }),

    // Update Resume
    updateResume: builder.mutation<
      { data: ResumeParsedData; message: string },
      { userId: string; data: ResumeParsedData }
    >({
      query: ({ userId, data }) => ({
        url: `/v1/resume/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Resume"],
    }),

    // Delete Resume
    deleteResume: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/v1/resume/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Resume"],
    }),
  }),
});

export const {
  useUploadResumeMutation,
  useGetResumeQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
} = api;
