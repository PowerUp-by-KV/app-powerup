import { api } from "./api";

export interface LoginRequest {
  email?: string;
  phone_number?: string;
  identifier?: string;
  password: string;
  remember_me?: boolean;
  oauth_id_token?: string;
  oauth_code?: string;
  oauth_redirect_uri?: string;
  oauth_code_verifier?: string;
}

export interface RegisterRequest {
  email: string;
  phone_number: string;
  password: string;
  name: string;
  remember_me?: boolean;
}

export interface User {
  id: string;
  email?: string;
  phone_number?: string;
  name: string;
  cefr_range?: string;
  learning_goal?: string;
  learning_frequency?: string;
  streak_count?: number;
  total_xp?: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  profile_completed?: boolean;
}

export interface AuthRegisterResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
}

export const authApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => {
        const body = Object.fromEntries(
          Object.entries(credentials).filter(([_, value]) => value !== undefined && value !== ""),
        ) as LoginRequest;
        const url = "/v1/auth/login";
        return {
          url,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body,
        };
      },
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<AuthRegisterResponse, RegisterRequest>({
      query: (userData) => {
        // Filter out undefined values from the payload
        const body = Object.fromEntries(
          Object.entries(userData).filter(([_, value]) => value !== undefined),
        );
        return {
          url: "/v1/auth/register",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Auth"],
    }),

    getProfile: builder.query<User, void>({
      query: () => "/v1/auth/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } = authApi;
