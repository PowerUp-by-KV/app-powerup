/**
 * src/services/resumeApiSlice.ts
 *
 * RTK Query slice for resume operations.
 *
 * ✅ Backend contract (v2) — all under /api/v1:
 *   POST /api/v1/upload           → upload PDF, receive parsed resume
 *   GET  /api/v1/parse/{id}       → fetch parsed data for a resume ID
 *
 * ⚠️  uploadResume uses native fetch() (not baseQuery) to prevent RTK Query
 *     from corrupting the multipart/form-data boundary header.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { USE_MOCK_API, API_V1_URL, AUTH_HEADERS } from "../constants/apiConfig";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UploadResumeArg {
  file: { uri: string | File; name?: string; type?: string };
  userId?: string;
}

// ── Mock data (matches real backend response shape) ──────────────────────────

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_UPLOAD_RESPONSE = {
  message: "Resume uploaded and parsed successfully",
  user_id: "mock-user-123",
  resume: {
    id: "mock-resume-456",
    filename: "resume.pdf",
    personal: {
      full_name: "Kevin Joshua",
      email: "kevin@example.com",
      phone: "+91 9876543210",
      location: "Chennai, India",
    },
    skills: ["React Native", "Java", "DSA", "JavaScript", "TypeScript"],
    experience: [
      {
        title: "Mobile Developer",
        company: "Tech Corp",
        duration: "2022 – Present",
        description: "Built cross-platform mobile applications using React Native.",
      },
    ],
    interview_metadata: {},
  },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

export const resumeApi = createApi({
  reducerPath: "resumeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_V1_URL, // https://host/api/v1
    prepareHeaders: (h) => {
      Object.entries(AUTH_HEADERS).forEach(([k, v]) => h.set(k, v));
      return h;
    },
  }),
  endpoints: (builder) => ({
    // ── POST /api/v1/upload ─────────────────────────────────────────────────
    uploadResume: builder.mutation<unknown, UploadResumeArg>({
      queryFn: async ({ file, userId = "" }) => {
        if (USE_MOCK_API) {
          await wait(1000);
          return {
            data: {
              ...MOCK_UPLOAD_RESPONSE,
              resume: { ...MOCK_UPLOAD_RESPONSE.resume, filename: file?.name ?? "resume.pdf" },
            },
          };
        }

        try {
          const formData = new FormData();

          if (file.uri instanceof File) {
            // Web: file.uri is already a browser File object
            formData.append("file", file.uri);
          } else {
            // React Native: provide { uri, name, type } object.
            // Do NOT set Content-Type — the runtime auto-sets multipart + boundary.
            formData.append("file", {
              uri: file.uri as string,
              name: file.name ?? "resume.pdf",
              type: file.type ?? "application/pdf",
            } as unknown as Blob);
          }

          // ✅ Correct endpoint: POST /api/v1/upload
          const qs = userId ? `?user_id=${encodeURIComponent(String(userId))}` : "";
          const url = `${API_V1_URL}/upload${qs}`;

          console.log("[Resume Upload] POST", url);
          console.log("[Resume Upload] file:", file.name, "userId:", userId);

          const response = await fetch(url, {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
              ...AUTH_HEADERS,
              // ⚠️  Do NOT set Content-Type — let fetch auto-set multipart boundary
            },
          });

          const responseText = await response.text();
          console.log("[Resume Upload] Status:", response.status);
          console.log("[Resume Upload] Raw response:", responseText.slice(0, 600));

          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
              const errJson = JSON.parse(responseText);
              errorMessage = errJson?.detail || errJson?.message || errJson?.error || errorMessage;
            } catch {
              errorMessage = responseText || errorMessage;
            }
            console.log("[Resume Upload] Error:", errorMessage);
            return { error: { status: response.status, data: errorMessage } };
          }

          let data: unknown;
          try {
            data = JSON.parse(responseText);
          } catch {
            data = { raw: responseText };
          }

          console.log("[Resume Upload] Parsed response:", data);
          return { data };
        } catch (err) {
          console.log("[Resume Upload] Fetch error:", err);
          return { error: { status: "FETCH_ERROR" as const, error: String(err) } };
        }
      },
    }),

    // ── GET /api/v1/parse/{resumeId} ────────────────────────────────────────
    parseResume: builder.query<unknown, string>({
      queryFn: async (resumeId, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_API) {
          await wait(300);
          return { data: MOCK_UPLOAD_RESPONSE.resume };
        }

        // ✅ Correct endpoint: GET /api/v1/parse/{id}
        const url = `${API_V1_URL}/parse/${encodeURIComponent(resumeId)}`;
        console.log("[Resume Parse] GET", url);

        const result = await baseQuery({ url, method: "GET" });

        if (result.error) {
          console.log("[Resume Parse] Error:", result.error);
          return { error: result.error };
        }

        console.log("[Resume Parse] Response:", result.data);
        return { data: result.data };
      },
    }),
  }),
});

export const { useUploadResumeMutation, useParseResumeQuery, useLazyParseResumeQuery } = resumeApi;
