import { api } from "./api";

export interface LoginRequest {
  email: string;
  password?: string;
  remember_me?: boolean;
  oauth_id_token?: string;
  oauth_code?: string;
  oauth_redirect_uri?: string;
  oauth_code_verifier?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  confirm_password?: string;
  remember_me?: boolean;
  oauth_id_token?: string;
  oauth_code?: string;
  oauth_redirect_uri?: string;
  oauth_code_verifier?: string;
}

export interface AuthResponse {
  access_token: string;
  profile_completed: boolean;
  email: string;
  [key: string]: unknown;
}

export const authApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/api/v1/auth/signup",
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
