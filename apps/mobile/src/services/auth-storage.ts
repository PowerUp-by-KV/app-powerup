import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface User {
  id: string;
  email?: string;
  phone_number?: string;
  name: string;
  cefr_range?: string | null;
  learning_goal?: string;
  learning_frequency?: string;
  streak_count?: number;
  total_xp?: number;
  profile_completed?: boolean;
}

export interface StoredSession {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user: User;
}

const AUTH_KEY = "powerup_auth_session";
const ASSESSMENT_SESSION_KEY = "powerup_assessment_session_id";
const PROFILE_COMPLETED_KEY = "powerup.profile_completed";
const LAST_LOGGED_IN_EMAIL_KEY = "powerup.last_logged_in_email";
const ONBOARDING_WIZARD_STATE_KEY = "powerup.onboarding_wizard_state";

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
  await saveAssessmentStartTime(Date.now());
}

export async function getAssessmentSessionId(): Promise<string | null> {
  return getItem(ASSESSMENT_SESSION_KEY);
}

export async function clearAssessmentSessionId(): Promise<void> {
  await deleteItem(ASSESSMENT_SESSION_KEY);
}

export async function getUser(): Promise<User | null> {
  const session = await getAuthSession();
  return session?.user || null;
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

const PRE_ASSESSMENT_COMPLETED_KEY = "powerup.pre_assessment_completed";

export async function setPreAssessmentCompletedInSession(completed: boolean): Promise<void> {
  await setItem(PRE_ASSESSMENT_COMPLETED_KEY, completed ? "1" : "0");
}

export async function getPreAssessmentCompletedInSession(): Promise<boolean> {
  const raw = await getItem(PRE_ASSESSMENT_COMPLETED_KEY);
  return raw === "1";
}

export async function clearPreAssessmentCompletedInSession(): Promise<void> {
  await deleteItem(PRE_ASSESSMENT_COMPLETED_KEY);
}

/**
 * Saves the email of the currently logged-in user.
 * On next login, if a different email is detected, stale local flags are cleared.
 */
export async function saveLastLoggedInEmail(email: string): Promise<void> {
  await setItem(LAST_LOGGED_IN_EMAIL_KEY, email.toLowerCase().trim());
}

export async function getLastLoggedInEmail(): Promise<string | null> {
  return getItem(LAST_LOGGED_IN_EMAIL_KEY);
}

/**
 * Call at login time: if the email has changed since the last login,
 * clears all device-local completion flags so they don't bleed across users.
 * Returns true if a user switch was detected (flags were cleared).
 */
export async function clearStaleLocalFlagsIfUserChanged(newEmail: string): Promise<boolean> {
  const lastEmail = await getLastLoggedInEmail();
  const normalized = newEmail.toLowerCase().trim();
  if (lastEmail && lastEmail !== normalized) {
    // Different user — wipe all device-local state
    await deleteItem(PROFILE_COMPLETED_KEY);
    await deleteItem(PRE_ASSESSMENT_COMPLETED_KEY);
    await deleteItem(COMPLETED_SECTIONS_KEY);
    await deleteItem(ASSESSMENT_SESSION_KEY);
    await deleteItem(ASSESSMENT_START_TIME_KEY);
    await deleteItem(ASSESSMENT_ELAPSED_TIME_KEY);
    await deleteItem(PRE_ASSESSMENT_RESULTS_KEY);
    await deleteItem(ONBOARDING_ANSWERS_KEY);
    await deleteItem(ONBOARDING_WIZARD_STATE_KEY);
    return true;
  }
  await setItem(LAST_LOGGED_IN_EMAIL_KEY, normalized);
  return false;
}

export async function saveOnboardingWizardState(state: {
  currentStep: number;
  formData: Record<string, unknown>;
}): Promise<void> {
  await setItem(ONBOARDING_WIZARD_STATE_KEY, JSON.stringify(state));
}

export async function getOnboardingWizardState(): Promise<{
  currentStep: number;
  formData: Record<string, unknown>;
} | null> {
  const raw = await getItem(ONBOARDING_WIZARD_STATE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearOnboardingWizardState(): Promise<void> {
  await deleteItem(ONBOARDING_WIZARD_STATE_KEY);
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

export async function syncCompletedSections(sections: string[]): Promise<void> {
  await setItem(COMPLETED_SECTIONS_KEY, JSON.stringify(sections));
}

export async function getCompletedSections(): Promise<string[]> {
  const raw = await getItem(COMPLETED_SECTIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearCompletedSections(): Promise<void> {
  await deleteItem(COMPLETED_SECTIONS_KEY);
}

const ASSESSMENT_START_TIME_KEY = "powerup.assessment_start_time";
const ASSESSMENT_ELAPSED_TIME_KEY = "powerup.assessment_elapsed_time";

export async function saveAssessmentStartTime(time: number): Promise<void> {
  const existing = await getItem(ASSESSMENT_START_TIME_KEY);
  if (!existing) {
    await setItem(ASSESSMENT_START_TIME_KEY, String(time));
  }
}

export async function getAssessmentStartTime(): Promise<number | null> {
  const raw = await getItem(ASSESSMENT_START_TIME_KEY);
  return raw ? Number(raw) : null;
}

export async function clearAssessmentStartTime(): Promise<void> {
  await deleteItem(ASSESSMENT_START_TIME_KEY);
}

export async function saveAssessmentElapsedTime(seconds: number): Promise<void> {
  await setItem(ASSESSMENT_ELAPSED_TIME_KEY, String(seconds));
}

export async function getAssessmentElapsedTime(): Promise<number> {
  const raw = await getItem(ASSESSMENT_ELAPSED_TIME_KEY);
  return raw ? Number(raw) : 0;
}

export async function clearAssessmentElapsedTime(): Promise<void> {
  await deleteItem(ASSESSMENT_ELAPSED_TIME_KEY);
}

export interface StoredPreAssessmentResult {
  percentage?: number;
  total_score?: number;
  max_score?: number;
  cefr_level?: string | null;
  cefr_range?: string | null;
  section_percentages?: Record<string, number>;
  timeTaken?: string;
}

const PRE_ASSESSMENT_RESULTS_KEY = "powerup.pre_assessment_results";

export async function savePreAssessmentResults(results: StoredPreAssessmentResult): Promise<void> {
  await setItem(PRE_ASSESSMENT_RESULTS_KEY, JSON.stringify(results));
}

export async function getPreAssessmentResults(): Promise<StoredPreAssessmentResult | null> {
  const raw = await getItem(PRE_ASSESSMENT_RESULTS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPreAssessmentResult;
  } catch {
    return null;
  }
}

export async function clearPreAssessmentResults(): Promise<void> {
  await deleteItem(PRE_ASSESSMENT_RESULTS_KEY);
}

const ONBOARDING_ANSWERS_KEY = "powerup.onboarding_answers";

export async function saveLocalOnboardingAnswers(answers: Record<string, unknown>): Promise<void> {
  await setItem(ONBOARDING_ANSWERS_KEY, JSON.stringify(answers));
}

export async function getLocalOnboardingAnswers(): Promise<Record<string, unknown> | null> {
  const raw = await getItem(ONBOARDING_ANSWERS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearLocalOnboardingAnswers(): Promise<void> {
  await deleteItem(ONBOARDING_ANSWERS_KEY);
}
