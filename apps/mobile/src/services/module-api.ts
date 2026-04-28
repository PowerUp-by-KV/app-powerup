import { api } from "./api";

import { MOCK_MODULES, MOCK_ACTIVITIES } from "@/constants/learning-data";

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
  day_no: number;
  status: "completed" | "current" | "locked";
  score?: number;
  activities: unknown[];
}

export const moduleApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getModules: builder.query<Module[], { user_id?: string; cefr_level?: string } | void>({
      // Backend Endpoint: query: () => '/api/v1/modules/',
      queryFn: () => ({ data: MOCK_MODULES }),
      providesTags: ["Results"],
    }),
    getVariants: builder.query<unknown[], { moduleId: string }>({
      query: ({ moduleId }) => `/api/v1/modules/${moduleId}/variants`,
    }),
    getModuleDays: builder.query<ModuleDay[], { moduleId: string; cefr_level?: string }>({
      // Backend Endpoint: query: ({ moduleId, variantId }) => `/api/v1/modules/${moduleId}/variants/${variantId}/days`,
      queryFn: ({ moduleId }) => {
        const days: ModuleDay[] = new Array(12).fill(null).map((_, i) => {
          const dayNo = i + 1;
          const key = `${moduleId}_${dayNo}`;
          const dayActivities = MOCK_ACTIVITIES[key] || [];

          return {
            day_no: dayNo,
            status: i === 0 ? "current" : "locked",
            activities: dayActivities,
          };
        });
        return { data: days };
      },
      providesTags: (result, error, { moduleId }) => [{ type: "Results", id: `DAYS-${moduleId}` }],
    }),
  }),
});

export const { useGetModulesQuery, useGetVariantsQuery, useGetModuleDaysQuery } = moduleApi;
