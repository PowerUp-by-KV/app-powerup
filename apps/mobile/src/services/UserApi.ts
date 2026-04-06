import { api } from "./api";
import { USER_PROFILE } from "@/constants/mockData";

export interface UserProfile {
  name: string;
  points: number;
  streak: number;
  completedLessons: number;
  rank: number;
  isPremium: boolean;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, void>({
      query: () => "/user/profile",
      // Use mock data as background for now
      transformResponse: (response: UserProfile) => response || USER_PROFILE,
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (err) {
          console.log("Using mock user data due to connection error");
        }
      },
    }),
  }),
});

export const { useGetUserProfileQuery } = userApi;
