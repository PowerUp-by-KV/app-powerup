import { api } from "./api";

export interface Module {
  module_id: string;
  module_no: number;
  name: string;
  description: string;
  status: "in_progress" | "locked" | "completed";
  total_days: number;
  days_completed: number;
  progress_percentage: number;
}

export interface ModuleDay {
  id: string;
  title: string;
  order_index: number;
  is_active: boolean;

  // Optional/missing fields that might be calculated or fetched elsewhere
  tag?: string;
  duration?: string;
  gradient?: string[];
  status?: "completed" | "current" | "locked";
  score?: number;
  activities?: unknown[];
}

export const moduleApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getModules: builder.query<Module[], { user_id?: string; cefr_level?: string } | void>({
      // Backend Endpoint: query: () => '/api/v1/modules/',
      query: (params) => ({ url: "/v1/modules/", params: params || {} }),
      providesTags: ["Results"],
    }),
    getVariants: builder.query<unknown[], { moduleId: string }>({
      query: ({ moduleId }) => `/v1/modules/${moduleId}/variants`,
    }),
    getModuleDays: builder.query<ModuleDay[], { moduleId: string; cefr_level?: string }>({
      // Backend Endpoint: query: ({ moduleId, variantId }) => `/v1/modules/${moduleId}/variants/${variantId}/days`,
      query: ({ moduleId, cefr_level }) => ({
        url: `/v1/modules/${moduleId}/days`,
        params: { cefr_level },
      }),
      providesTags: (result, error, { moduleId }) => [{ type: "Results", id: `DAYS-${moduleId}` }],
    }),
  }),
});

export const { useGetModulesQuery, useGetVariantsQuery, useGetModuleDaysQuery } = moduleApi;
