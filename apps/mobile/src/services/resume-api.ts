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
      // Use token from environment variables
      const token = process.env.EXPO_PUBLIC_ACCESS_TOKEN;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      // Note: We don't explicitly set Content-Type to application/json here
      // so that FormData requests can automatically set their boundary headers.
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
    getResume: builder.query<ResumeUploadResponse, string>({
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
      query: ({ userId, data }) => {
        // Reverse map frontend state back to backend schema
        const mappedData = {
          contact: {
            name: data.contact.fullName || "",
            email: data.contact.email || "",
            phone: data.contact.phone || "",
            linkedin: data.contact.linkedin || "",
            location: data.contact.location || "",
          },
          summary: data.summary?.text || "",
          education: (data.education || []).map((edu) => ({
            institution: edu.school || "",
            degree: edu.degree || "",
            field: edu.field || "",
            start_year: "",
            end_year: edu.graduationDate || "",
            gpa: edu.details ? edu.details.replace("GPA: ", "") : "",
          })),
          experience: (data.experience || []).map((exp) => ({
            company: exp.company || "",
            title: exp.position || "",
            start_date: exp.startDate || "",
            end_date: exp.endDate || null,
            description: exp.description || "",
            highlights: [],
          })),
          skills: (data.skills || []).map((s: any) => s.name || s),
          projects: (data.projects || []).map((p) => ({
            name: p.name || "",
            description: p.description || "",
            technologies: p.technologies || [],
          })),
          certifications: (data.certifications || []).map((c: any) => c.name || c),
          achievements: data.achievements || [],
          languages: data.languages || [],
          extracurricular: data.extracurricular || [],
        };

        return {
          url: `/resume/${userId}`,
          method: "PUT",
          body: { parsed_data: mappedData },
        };
      },
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
