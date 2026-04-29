import { api } from "./api";
import { ApiResponse, UserProfile } from "./types";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => ({
        url: "/user/profile",
        params: { userId },
      }),
      transformResponse: (response: ApiResponse<UserProfile>) => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      },
      providesTags: (result, error, userId) => [{ type: "Auth", id: userId }],
    }),

    updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile> & { userId: string }>({
      query: ({ userId, ...body }) => ({
        url: "/user/update",
        method: "PUT",
        body,
        params: { userId },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: "Auth", id: userId }],
    }),
  }),
});

export const { useGetUserProfileQuery, useUpdateUserProfileMutation } = userApi;
