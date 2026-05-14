import * as SecureStore from "expo-secure-store";

export interface StoredSession {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    cefr_range: string | null;
  };
}

const AUTH_KEY = "@powerup_auth_session";
const ASSESSMENT_SESSION_KEY = "@powerup_assessment_session_id";
const PROFILE_COMPLETED_KEY = "powerup.profile_completed";

export async function saveAuthSession(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(session));
}

export async function getAuthSession(): Promise<StoredSession | null> {
  const raw = await SecureStore.getItemAsync(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_KEY);
}

export async function saveAssessmentSessionId(sessionId: string): Promise<void> {
  await SecureStore.setItemAsync(ASSESSMENT_SESSION_KEY, sessionId);
}

export async function getAssessmentSessionId(): Promise<string | null> {
  return SecureStore.getItemAsync(ASSESSMENT_SESSION_KEY);
}

export async function clearAssessmentSessionId(): Promise<void> {
  await SecureStore.deleteItemAsync(ASSESSMENT_SESSION_KEY);
}

export async function setProfileCompletedInSession(completed: boolean): Promise<void> {
  await SecureStore.setItemAsync(PROFILE_COMPLETED_KEY, completed ? "1" : "0");
}

export async function getProfileCompletedInSession(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(PROFILE_COMPLETED_KEY);
  return raw === "1";
}

export async function clearProfileCompletedInSession(): Promise<void> {
  await SecureStore.deleteItemAsync(PROFILE_COMPLETED_KEY);
}
