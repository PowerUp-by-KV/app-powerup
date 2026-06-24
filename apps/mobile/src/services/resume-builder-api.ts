import { api } from "./api";
import {
  fromResumeBuilderResponse,
  toResumeBuilderPayload,
} from "@/features/resume-builder/utils/resume-builder.mapper";
import type { BuilderResume } from "@/features/resume-builder/types/resume-builder.types";

export interface ResumeEnhanceRequest {
  section: string;
  text: string;
}

export interface ResumeEnhanceResponse {
  enhanced_text: string;
}

export interface ResumeExportResponse {
  url: string;
}

export interface ResumePhotoUploadResponse {
  url: string;
}

export const resumeBuilderApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBuiltResume: builder.query<BuilderResume, void>({
      query: () => ({
        url: "/v1/resume-builder",
        method: "GET",
      }),
      transformResponse: (response: unknown) => fromResumeBuilderResponse(response),
      providesTags: ["Resume"],
    }),

    updateBuiltResume: builder.mutation<BuilderResume, BuilderResume>({
      query: (resume) => ({
        url: "/v1/resume-builder",
        method: "PUT",
        body: toResumeBuilderPayload(resume),
      }),
      transformResponse: (response: unknown) => fromResumeBuilderResponse(response),
      // Do NOT invalidate the Resume tag here.
      // Invalidating causes useGetBuiltResumeQuery to refetch and dispatch hydrateResume,
      // which silently overwrites the user's layout/template selection with the old DB value.
      // We manage resume state locally in Redux after the initial load.
    }),

    uploadBuiltResumePhoto: builder.mutation<ResumePhotoUploadResponse, FormData>({
      query: (formData) => ({
        url: "/v1/resume-builder/photo",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Resume"],
    }),

    enhanceBuiltResumeDetail: builder.mutation<ResumeEnhanceResponse, ResumeEnhanceRequest>({
      query: (body) => ({
        url: "/v1/resume-builder/enhance",
        method: "POST",
        body,
      }),
    }),

    exportBuiltResume: builder.query<
      ResumeExportResponse,
      { auto_enhance: boolean; file_type?: "pdf" | "docx" }
    >({
      query: ({ auto_enhance, file_type = "pdf" }) => ({
        url: "/v1/resume-builder/export",
        method: "GET",
        params: { auto_enhance, file_type },
      }),
    }),
  }),
});

export const {
  useGetBuiltResumeQuery,
  useLazyGetBuiltResumeQuery,
  useUpdateBuiltResumeMutation,
  useUploadBuiltResumePhotoMutation,
  useEnhanceBuiltResumeDetailMutation,
  useExportBuiltResumeQuery,
  useLazyExportBuiltResumeQuery,
} = resumeBuilderApi;
