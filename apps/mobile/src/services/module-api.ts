import { api } from "./api";
import { ApiResponse } from "./types";

export interface Module {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  is_active: boolean;
}

export interface ModuleVariant {
  id: string;
  cefr_level: string;
}

export interface ModuleDay {
  id: string;
  day_number: number;
  topic: string;
  duration_hours?: number;
}

export const moduleApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getModules: builder.query<Module[], { user_id?: string; cefr_level?: string }>({
      query: () => "/modules/",
      providesTags: ["Results"],
    }),
    getVariants: builder.query<ModuleVariant[], string>({
      query: (moduleId) => `/modules/${moduleId}/variants`,
    }),
    getDaysByVariant: builder.query<ModuleDay[], { moduleId: string; variantId: string }>({
      query: ({ moduleId, variantId }) => `/modules/${moduleId}/variants/${variantId}/days`,
      providesTags: (result, error, { variantId }) => [
        { type: "Results", id: `DAYS-${variantId}` },
      ],
    }),
  }),
});

export const { useGetModulesQuery, useGetVariantsQuery, useGetDaysByVariantQuery } = moduleApi;
