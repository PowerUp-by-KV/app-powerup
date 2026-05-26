import { api } from "./api";

export interface UnlockedModule {
  module_id: string;
  module_no: number;
  title: string;
  completed: boolean;
  locked: boolean;
  unlocked_days: number[];
  wave: number;
}

export interface ProgressionResponse {
  current_wave: number;
  current_day_phase: number[];
  unlocked_modules: UnlockedModule[];
}

export const progressionApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProgression: builder.query<ProgressionResponse, void>({
      query: () => "/v1/progression",
      providesTags: ["Modules"],
    }),
  }),
});

export const {
  useGetProgressionQuery,
  useLazyGetProgressionQuery,
} = progressionApi;
