/**
 * Resume API Service
 * RTK Query endpoints for resume management with comprehensive error handling
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ResumeParsedData, ResumeUploadResponse } from "@app-powerup/shared";
import { ApiErrorHandler } from "./error-handler";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const resumeApi = createApi({
  reducerPath: "resumeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/v1`,
    prepareHeaders: (headers) => {
      // TODO: Add auth token from secure storage
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Resume"],
  endpoints: (builder) => ({
    // POST /v1/resume/upload - Upload PDF and parse
    uploadResume: builder.mutation<ResumeUploadResponse, FormData>({
      query: (formData) => ({
        url: "/resume/upload",
        method: "POST",
        body: formData,
        headers: {
          // Remove Content-Type header for FormData to set boundary
        },
      }),
      invalidatesTags: ["Resume"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          ApiErrorHandler.logError(null, "uploadResume", { success: true });
        } catch (error: any) {
          const apiError = ApiErrorHandler.parseError(error.error, "upload");
          ApiErrorHandler.logError(error.error, "uploadResume", {
            userMessage: apiError.userMessage,
          });
          console.error("Upload error:", apiError.userMessage);
        }
      },
    }),

    // GET /v1/resume/{user_id} - Fetch user's resume
    getResume: builder.query<ResumeParsedData, string>({
      query: (userId) => ({
        url: `/resume/${userId}`,
        method: "GET",
      }),
      providesTags: ["Resume"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          ApiErrorHandler.logError(null, "getResume", { success: true, userId: arg });
        } catch (error: any) {
          const apiError = ApiErrorHandler.parseError(error.error, "fetch");
          ApiErrorHandler.logError(error.error, "getResume", {
            userId: arg,
            userMessage: apiError.userMessage,
          });
          console.error("Fetch error:", apiError.userMessage);
        }
      },
    }),

    // PUT /v1/resume/{user_id} - Update resume
    updateResume: builder.mutation<
      ResumeUploadResponse,
      { userId: string; data: ResumeParsedData }
    >({
      query: ({ userId, data }) => ({
        url: `/resume/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Resume"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          ApiErrorHandler.logError(null, "updateResume", { success: true, userId: arg.userId });
        } catch (error: any) {
          const apiError = ApiErrorHandler.parseError(error.error, "update");
          ApiErrorHandler.logError(error.error, "updateResume", {
            userId: arg.userId,
            userMessage: apiError.userMessage,
          });
          console.error("Update error:", apiError.userMessage);
        }
      },
    }),

    // DELETE /v1/resume/{user_id} - Delete resume
    deleteResume: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/resume/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Resume"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          ApiErrorHandler.logError(null, "deleteResume", { success: true, userId: arg });
        } catch (error: any) {
          const apiError = ApiErrorHandler.parseError(error.error, "delete");
          ApiErrorHandler.logError(error.error, "deleteResume", {
            userId: arg,
            userMessage: apiError.userMessage,
          });
          console.error("Delete error:", apiError.userMessage);
        }
      },
    }),
  }),
});

export const {
  useUploadResumeMutation,
  useGetResumeQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
} = resumeApi;
