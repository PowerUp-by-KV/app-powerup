import { api } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
  oauth_id_token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  remember_me?: boolean;
}

export interface AuthResponse {
  access_token: string;
  profile_completed: boolean;
  email: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
    }),

    getProfile: builder.query<{ email: string; profile_completed: boolean }, void>({
      query: () => "/auth/profile",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } = authApi;
