import { api } from "./api";
import type { StoredSession } from "./auth-storage";

export type AuthResponse = StoredSession;

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
  oauth_id_token?: string;
  oauth_code?: string;
  oauth_redirect_uri?: string;
  oauth_code_verifier?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  phone_number: string | null;
  name: string;
  cefr_range: string | null;
  learning_goal: string | null;
  learning_frequency: string | null;
  streak_count: number;
  total_xp: number;
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
        console.log("Making login request to:", url);
        console.log("Full URL would be:", process.env.EXPO_PUBLIC_API_URL + url);
        console.log("Login request body:", body);
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

    register: builder.mutation<AuthResponse, RegisterRequest>({
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

    getProfile: builder.query<UserProfile, void>({
      query: () => "/v1/auth/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } = authApi;
