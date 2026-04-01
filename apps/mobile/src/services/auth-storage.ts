import AsyncStorage from "@react-native-async-storage/async-storage";

export const AUTH_SESSION_KEY = "auth_session";

export type AuthUser = {
  id: string;
  email: string;
  oauth_provider: string | null;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  remember_me: boolean;
  profile_completed: boolean;
  user: AuthUser;
};

export const saveAuthSession = async (session: AuthResponse): Promise<void> => {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const getAuthSession = async (): Promise<AuthResponse | null> => {
  const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
};

export const clearAuthSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
};

export const setProfileCompletedInSession = async (
  completed: boolean,
): Promise<AuthResponse | null> => {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const updatedSession: AuthResponse = {
    ...session,
    profile_completed: completed,
  };

  await saveAuthSession(updatedSession);
  return updatedSession;
};
