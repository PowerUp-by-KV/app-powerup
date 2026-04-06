import { AuthResponse } from "@/services/auth-storage";

export function clearAuthState(): Promise<void> {
  return Promise.resolve();
}

export function setAuthToken(_token: string): void {
  return;
}

export function getApiErrorMessage(error: any, fallback: string): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
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
    profile_completed: false,
    email: data.email,
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
    profile_completed: false,
    email: data.email,
  } as AuthResponse;
}

export async function signupWithGoogleIdToken(data: {
  email: string;
  oauth_id_token: string;
}): Promise<AuthResponse> {
  return {
    access_token: "",
    profile_completed: false,
    email: data.email,
  } as AuthResponse;
}
