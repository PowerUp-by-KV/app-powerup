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
      query: (credentials) => {
        const url = "/v1/auth/login";
        console.log("Making login request to:", url);
        console.log("Full URL would be:", process.env.EXPO_PUBLIC_API_URL + url);
        return {
          url,
          method: "POST",
          body: credentials,
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

    getProfile: builder.query<{ email: string; profile_completed: boolean }, void>({
      query: () => "/auth/profile",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } = authApi;
