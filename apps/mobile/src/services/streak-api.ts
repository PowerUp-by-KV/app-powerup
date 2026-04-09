import { api } from "./api";
import { ApiResponse, StreakData } from "./types";
import { USER_PROFILE } from "@/constants/mockData";

const streakApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStreak: builder.query<StreakData, string>({
      query: (userId) => `/api/streak/${userId}`,
      transformResponse: (response: ApiResponse<StreakData>, meta, arg) => {
        return response?.success
          ? response.data
          : {
              userId: arg,
              currentStreak: USER_PROFILE.streak,
              lastUpdated: new Date().toISOString(),
            };
      },
      providesTags: (result, error, userId) => [{ type: "Streak", id: userId }],
    }),
  }),
});

export const { useGetStreakQuery } = streakApi;
