/**
 * Resume API Service
 * RTK Query endpoints for resume management with comprehensive error handling
 */

import type { ResumeParsedData, ResumeUploadResponse } from "@app-powerup/shared";
import { api } from "./api";
import { ApiErrorHandler } from "./error-handler";

export const resumeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST /v1/resume/upload - Upload PDF and parse
    uploadResume: builder.mutation<ResumeUploadResponse, FormData>({
      query: (formData) => ({
        url: "/v1/resume/upload",
        method: "POST",
        body: formData,
        headers: {
          // Remove Content-Type header for FormData to set boundary
        },
      }),
      invalidatesTags: ["Resume"],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
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
        url: `/v1/resume/${userId}`,
        method: "GET",
      }),
      providesTags: ["Resume"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
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
            start_year: null,
            end_year: edu.graduationDate
              ? parseInt(edu.graduationDate.match(/\d{4}/)?.[0] || "", 10) || null
              : null,
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
          skills: (data.skills || []).map((s: any) => (typeof s === "string" ? s : s.name || "")),
          projects: (data.projects || []).map((p) => ({
            name: p.name || "",
            description: p.description || "",
            technologies: p.technologies || [],
          })),
          certifications: (data.certifications || []).map((c: any) =>
            typeof c === "string" ? c : c.name || "",
          ),
          achievements: (data.achievements || []).map((a: any) =>
            typeof a === "string" ? a : a.name || "",
          ),
          languages: (data.languages || []).map((l: any) =>
            typeof l === "string" ? l : l.name || "",
          ),
          extracurricular: (data.extracurricular || []).map((e: any) =>
            typeof e === "string" ? e : e.name || "",
          ),
        };

        return {
          url: `/v1/resume/${userId}`,
          method: "PUT",
          body: { parsed_data: mappedData },
        };
      },
      invalidatesTags: ["Resume"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
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
        url: `/v1/resume/${userId}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: ["Resume"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
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
  overrideExisting: false,
});

export const {
  useUploadResumeMutation,
  useGetResumeQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
} = resumeApi;
