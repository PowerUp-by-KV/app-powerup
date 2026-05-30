import { api } from "./api";

export type DiagnosticSectionCode = "section_a" | "section_b" | "section_c" | "section_d";

export interface DiagnosticStartResponse {
  attempt_id: string;
  sections: DiagnosticSectionCode[];
  current_section: DiagnosticSectionCode;
  status: "in_progress" | "completed" | "abandoned";
}

export interface DiagnosticSectionSubmitResponse {
  attempt_id: string;
  section_code: DiagnosticSectionCode;
  score: number;
  completed: boolean;
  next_section: DiagnosticSectionCode | null;
}

export interface DiagnosticFinalizeResponse {
  attempt_id: string;
  status: "completed";
  aggregate_score: number;
  cefr_band: string;
  learning_path_assigned: string;
}

export interface DiagnosticResultResponse {
  attempt_id: string;
  status: "completed";
  aggregate_score: number;
  cefr_band: string;
  section_scores: Record<DiagnosticSectionCode, number>;
  completed_at: string;
  learning_path_assigned: string;
}

export interface DiagnosticStatusResponse {
  attempt_id: string;
  status: "in_progress" | "completed" | "abandoned";
  completed_sections: DiagnosticSectionCode[];
  progress_percentage: number;
}

export const diagnosticApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    startDiagnostic: builder.mutation<DiagnosticStartResponse, void>({
      query: () => ({
        url: "/v1/diagnostic/start",
        method: "POST",
      }),
      invalidatesTags: ["Onboarding"],
    }),
    submitDiagnosticSection: builder.mutation<
      DiagnosticSectionSubmitResponse,
      { attemptId: string; sectionCode: DiagnosticSectionCode; payload: Record<string, any> }
    >({
      query: ({ attemptId, sectionCode, payload }) => ({
        url: `/v1/diagnostic/${attemptId}/sections/${sectionCode}/submit`,
        method: "POST",
        body: { payload },
      }),
      invalidatesTags: ["Onboarding"],
    }),
    finalizeDiagnostic: builder.mutation<DiagnosticFinalizeResponse, string>({
      query: (attemptId) => ({
        url: `/v1/diagnostic/${attemptId}/finalize`,
        method: "POST",
      }),
      invalidatesTags: ["Onboarding", "Modules"],
    }),
    getDiagnosticResult: builder.query<DiagnosticResultResponse, string>({
      query: (attemptId) => `/v1/diagnostic/${attemptId}/result`,
      providesTags: ["Onboarding"],
    }),
    getDiagnosticStatus: builder.query<DiagnosticStatusResponse, string>({
      query: (attemptId) => `/v1/diagnostic/${attemptId}/status`,
      providesTags: ["Onboarding"],
    }),
  }),
});

export const {
  useStartDiagnosticMutation,
  useSubmitDiagnosticSectionMutation,
  useFinalizeDiagnosticMutation,
  useGetDiagnosticResultQuery,
  useGetDiagnosticStatusQuery,
} = diagnosticApi;
