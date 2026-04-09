export interface AuthResponse {
  access_token: string;
  profile_completed: boolean;
  [key: string]: unknown;
}

export async function saveAuthSession(_auth: AuthResponse): Promise<void> {
  return;
}

export async function getAuthSession(): Promise<AuthResponse | null> {
  return null;
}

export async function clearAuthState(): Promise<void> {
  return;
}

export async function clearAuthSession(): Promise<void> {
  return;
}

export async function setProfileCompletedInSession(_completed: boolean): Promise<void> {
  return;
}
