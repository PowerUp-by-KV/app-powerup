import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

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

const AUTH_KEY = "powerup_auth_session";
const ASSESSMENT_SESSION_KEY = "powerup_assessment_session_id";
const PROFILE_COMPLETED_KEY = "powerup.profile_completed";

const isWeb = Platform.OS === "web";

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthSession(session: StoredSession): Promise<void> {
  await setItem(AUTH_KEY, JSON.stringify(session));
}

export async function getAuthSession(): Promise<StoredSession | null> {
  const raw = await getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await deleteItem(AUTH_KEY);
}

export async function saveAssessmentSessionId(sessionId: string): Promise<void> {
  await setItem(ASSESSMENT_SESSION_KEY, sessionId);
}

export async function getAssessmentSessionId(): Promise<string | null> {
  return getItem(ASSESSMENT_SESSION_KEY);
}

export async function clearAssessmentSessionId(): Promise<void> {
  await deleteItem(ASSESSMENT_SESSION_KEY);
}

export async function setProfileCompletedInSession(completed: boolean): Promise<void> {
  await setItem(PROFILE_COMPLETED_KEY, completed ? "1" : "0");
}

export async function getProfileCompletedInSession(): Promise<boolean> {
  const raw = await getItem(PROFILE_COMPLETED_KEY);
  return raw === "1";
}

export async function clearProfileCompletedInSession(): Promise<void> {
  await deleteItem(PROFILE_COMPLETED_KEY);
}

const COMPLETED_SECTIONS_KEY = "powerup.completed_sections";

export async function saveCompletedSection(section: string): Promise<void> {
  const raw = await getItem(COMPLETED_SECTIONS_KEY);
  const existing: string[] = raw ? JSON.parse(raw) : [];
  if (!existing.includes(section)) {
    existing.push(section);
    await setItem(COMPLETED_SECTIONS_KEY, JSON.stringify(existing));
  }
}

export async function getCompletedSections(): Promise<string[]> {
  const raw = await getItem(COMPLETED_SECTIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearCompletedSections(): Promise<void> {
  await deleteItem(COMPLETED_SECTIONS_KEY);
}
