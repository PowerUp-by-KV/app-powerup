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
}

export interface AuthRegisterResponse {
  user_id?: string;
  access_token: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string | null;
    phone_number: string | null;
    name: string;
  };
}

// Matches AuthLoginResponse from the API: POST /api/v1/auth/social/google
export interface GoogleAuthRequest {
  id_token: string;
}

export interface SocialAuthLoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string | null;
    name: string;
    phone_number?: string | null;
    cefr_range?: string | null;
    profile_completed?: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string | null;
  phone_number: string | null;
  name: string;
  cefr_range: string | null;
  learning_goal: string | null;
  learning_frequency: string | null;
  profile_completed: boolean;
  streak_count: number;
  total_xp: number;
  weekly_streak: boolean[];
  current_level: number;
  modules_completed: number;
  total_modules: number;
  badges_count: number;
  nickname: string | null;
  country: string | null;
  gender: string | null;
  address: string | null;
  language: string | null;
  avatar_id: string | null;
  email_verified?: boolean;
}

export interface GoogleAuthRequest {
  id_token: string;
}

export interface SendEmailOtpRequest {
  email: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  code: string;
}

export interface EmailOtpStatusResponse {
  email: string;
  sent: boolean;
}

export interface UserUpdate {
  name?: string;
  nickname?: string;
  phone_number?: string;
  country?: string;
  gender?: string;
  address?: string;
  language?: string;
  avatar_id?: string;
  learning_goal?: string;
  learning_frequency?: string;
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
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { saveAuthSession } = await import("./auth-storage");
          await saveAuthSession(data);
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch {}
      },
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<AuthRegisterResponse, RegisterRequest>({
      query: (userData) => {
        const body = Object.fromEntries(
          Object.entries(userData).filter(([_, value]) => value !== undefined),
        );
        return {
          url: "/v1/auth/register",
          method: "POST",
          body,
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { saveAuthSession } = await import("./auth-storage");
          const auth: AuthResponse = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: {
              id: data.user?.id || data.user_id || "",
              name: data.user?.name || "",
              email: arg.email,
              phone_number: arg.phone_number || "",
            },
          };
          await saveAuthSession(auth);
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch {}
      },
      invalidatesTags: ["Auth"],
    }),

    getProfile: builder.query<UserProfile, void>({
      query: () => "/v1/auth/me",
      providesTags: ["Auth"],
    }),

    patchProfile: builder.mutation<UserProfile, UserUpdate>({
      query: (body) => ({ url: "/v1/auth/me", method: "PATCH", body }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          authApi.util.updateQueryData("getProfile", undefined, (draft) => {
            Object.assign(draft, body);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Auth"],
    }),

    sendEmailOtp: builder.mutation<EmailOtpStatusResponse, SendEmailOtpRequest>({
      query: (body) => ({
        url: "/v1/auth/send-email-otp",
        method: "POST",
        body,
      }),
    }),

    verifyEmailOtp: builder.mutation<AuthResponse, VerifyEmailOtpRequest>({
      query: (body) => ({
        url: "/v1/auth/verify-email-otp",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { saveAuthSession } = await import("./auth-storage");
          await saveAuthSession(data);
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch {}
      },
      invalidatesTags: ["Auth"],
    }),

    socialGoogleLogin: builder.mutation<AuthResponse, GoogleAuthRequest>({
      query: (body) => ({
        url: "/v1/auth/social/google",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { saveAuthSession } = await import("./auth-storage");
          await saveAuthSession(data);
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch {}
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  usePatchProfileMutation,
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useSocialGoogleLoginMutation,
} = authApi;
