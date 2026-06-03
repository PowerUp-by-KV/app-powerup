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
      invalidatesTags: ["Resume"],
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

    exportBuiltResumePdf: builder.query<ResumeExportResponse, { auto_enhance: boolean }>({
      query: ({ auto_enhance }) => ({
        url: "/v1/resume-builder/export",
        method: "GET",
        params: { auto_enhance },
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
  useExportBuiltResumePdfQuery,
  useLazyExportBuiltResumePdfQuery,
} = resumeBuilderApi;
