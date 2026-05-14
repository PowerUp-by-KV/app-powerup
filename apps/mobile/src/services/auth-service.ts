import type { AuthResponse } from "@/services/auth-api";

export function clearAuthState(): Promise<void> {
  return Promise.resolve();
}

export function setAuthToken(_token: string): void {
  return;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if ((error as { response?: { data?: { message?: string } } })?.response?.data?.message) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  if ((error as { message?: string })?.message) {
    return (error as { message: string }).message;
  }

  return fallback;
}

export async function restoreSession(): Promise<AuthResponse | null> {
  return null;
}

export async function signupWithEmail(data: {
  email: string;
  password: string;
  confirm_password: string;
  remember_me: boolean;
}): Promise<AuthResponse> {
  return {
    access_token: "",
    token_type: "bearer",
    user: { id: "", email: data.email, name: "", cefr_range: null },
  } as AuthResponse;
}

export async function signupWithGoogleCode(data: {
  email: string;
  oauth_code: string;
  oauth_redirect_uri: string;
  oauth_code_verifier: string;
}): Promise<AuthResponse> {
  return {
    access_token: "",
    token_type: "bearer",
    user: { id: "", email: data.email, name: "", cefr_range: null },
  } as AuthResponse;
}

export async function signupWithGoogleIdToken(data: {
  email: string;
  oauth_id_token: string;
}): Promise<AuthResponse> {
  return {
    access_token: "",
    token_type: "bearer",
    user: { id: "", email: data.email, name: "", cefr_range: null },
  } as AuthResponse;
}
