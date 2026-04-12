export interface AuthResponse {
  access_token: string;
  profile_completed: boolean;
  email?: string;
  [key: string]: unknown;
}

let authSession: AuthResponse | null = null;

export async function saveAuthSession(auth: AuthResponse): Promise<void> {
  authSession = {
    ...auth,
    access_token:
      auth.access_token ??
      (auth as { token?: string }).token ??
      (auth as { accessToken?: string }).accessToken ??
      "",
    profile_completed:
      auth.profile_completed ?? (auth as { profileCompleted?: boolean }).profileCompleted ?? false,
  };
}

export async function getAuthSession(): Promise<AuthResponse | null> {
  return authSession;
}

export async function clearAuthState(): Promise<void> {
  authSession = null;
}

export async function clearAuthSession(): Promise<void> {
  authSession = null;
}

export async function setProfileCompletedInSession(completed: boolean): Promise<void> {
  if (authSession) {
    authSession.profile_completed = completed;
  }
}
