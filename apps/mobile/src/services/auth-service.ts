import { api } from "@/utils/api";
import { AxiosError } from "axios";
import {
  AuthResponse,
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from "./auth-storage";

type EmailAuthPayload = {
  email: string;
  password: string;
  confirm_password?: string;
  remember_me: boolean;
};

type GoogleIdTokenPayload = {
  email: string;
  oauth_id_token: string;
};

type GoogleCodePayload = {
  email: string;
  oauth_code: string;
  oauth_redirect_uri: string;
  oauth_code_verifier: string;
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

const persistSession = async (
  response: AuthResponse,
): Promise<AuthResponse> => {
  await saveAuthSession(response);
  setAuthToken(response.access_token);
  return response;
};

export const restoreSession = async (): Promise<AuthResponse | null> => {
  const session = await getAuthSession();

  if (!session) {
    setAuthToken(null);
    return null;
  }

  // Restore only remembered sessions on cold start.
  if (!session.remember_me) {
    await clearAuthSession();
    setAuthToken(null);
    return null;
  }

  setAuthToken(session.access_token);
  return session;
};

export const clearAuthState = async () => {
  await clearAuthSession();
  setAuthToken(null);
};

export const signupWithEmail = async (
  payload: EmailAuthPayload,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/signup", payload);
  return persistSession(response.data);
};

export const signupWithGoogleIdToken = async (
  payload: GoogleIdTokenPayload,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/signup", payload);
  return persistSession(response.data);
};

export const signupWithGoogleCode = async (
  payload: GoogleCodePayload,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/signup", payload);
  return persistSession(response.data);
};

export const loginWithEmail = async (
  payload: Omit<EmailAuthPayload, "confirm_password">,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return persistSession(response.data);
};

export const loginWithGoogleIdToken = async (
  payload: GoogleIdTokenPayload,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return persistSession(response.data);
};

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const status = error.response?.status;
  const backendData = error.response?.data as
    | {
        message?: string;
        error?: string;
        details?: string;
        detail?:
          | string
          | {
              msg?: string;
            }[];
      }
    | undefined;

  const detailMessage = Array.isArray(backendData?.detail)
    ? backendData?.detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join("\n")
    : backendData?.detail;

  if (status === 400) {
    return backendData?.message ?? backendData?.error ?? "Invalid request.";
  }

  if (status === 401) {
    return "Session expired. Please login again.";
  }

  if (status === 409) {
    return backendData?.message ?? "Account already exists.";
  }

  return (
    backendData?.message ??
    backendData?.error ??
    backendData?.details ??
    detailMessage ??
    fallback
  );
};
