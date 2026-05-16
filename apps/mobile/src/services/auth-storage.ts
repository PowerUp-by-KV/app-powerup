export interface User {
  id: string;
  email?: string;
  phone_number?: string;
  name: string;
  cefr_range?: string;
  learning_goal?: string;
  learning_frequency?: string;
  streak_count?: number;
  total_xp?: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  profile_completed?: boolean; // Maintain for internal logic
}

const STORAGE_KEY = "@powerup_auth_session";

let inMemorySession: AuthResponse | null = null;

async function trySecureStoreAvailable(): Promise<unknown | null> {
  try {
    const mod = await import("expo-secure-store");
    return mod;
  } catch {
    return null;
  }
}

export async function saveAuthSession(auth: AuthResponse): Promise<void> {
  const normalized: AuthResponse = {
    ...auth,
    access_token: auth.access_token || "",
    refresh_token: auth.refresh_token || "",
    // Only trust explicit profile_completed from server; default to false for new users
    profile_completed: auth.profile_completed === true,
  };

  inMemorySession = normalized;

  const SecureStore = await trySecureStoreAvailable();
  if (
    SecureStore &&
    typeof (SecureStore as { setItemAsync?: unknown }).setItemAsync === "function"
  ) {
    try {
      const ss = SecureStore as { setItemAsync: (k: string, v: string) => Promise<void> };
      await ss.setItemAsync(STORAGE_KEY, JSON.stringify(normalized));
      return;
    } catch {
      // fallthrough to in-memory fallback
    }
  }

  // If SecureStore not available, attempt AsyncStorage (if present)
  try {
    const mod = await import("@react-native-async-storage/async-storage");
    const AsyncStorage = (mod as { default?: unknown }).default ?? mod;
    if (AsyncStorage && typeof (AsyncStorage as { setItem?: unknown }).setItem === "function") {
      const asStorage = AsyncStorage as { setItem: (k: string, v: string) => Promise<void> };
      await asStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return;
    }
  } catch {
    // ignore
  }

  // final fallback: keep in memory only
}

export async function getAuthSession(): Promise<AuthResponse | null> {
  if (inMemorySession) return inMemorySession;

  const SecureStore = await trySecureStoreAvailable();
  if (
    SecureStore &&
    typeof (SecureStore as { getItemAsync?: unknown }).getItemAsync === "function"
  ) {
    try {
      const ss = SecureStore as { getItemAsync: (k: string) => Promise<string | null> };
      const raw = await ss.getItemAsync(STORAGE_KEY);
      if (raw) {
        inMemorySession = JSON.parse(raw) as AuthResponse;
        return inMemorySession;
      }
    } catch {}
  }

  try {
    const mod = await import("@react-native-async-storage/async-storage");
    const AsyncStorage = (mod as { default?: unknown }).default ?? mod;
    if (AsyncStorage && typeof (AsyncStorage as { getItem?: unknown }).getItem === "function") {
      const asStorage = AsyncStorage as { getItem: (k: string) => Promise<string | null> };
      const raw = await asStorage.getItem(STORAGE_KEY);
      if (raw) {
        inMemorySession = JSON.parse(raw) as AuthResponse;
        return inMemorySession;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export async function clearAuthState(): Promise<void> {
  inMemorySession = null;

  const SecureStore2 = await trySecureStoreAvailable();
  if (
    SecureStore2 &&
    typeof (SecureStore2 as { deleteItemAsync?: unknown }).deleteItemAsync === "function"
  ) {
    try {
      const ss = SecureStore2 as { deleteItemAsync: (k: string) => Promise<void> };
      await ss.deleteItemAsync(STORAGE_KEY);
      return;
    } catch {}
  }

  try {
    const mod = await import("@react-native-async-storage/async-storage");
    const AsyncStorage = (mod as { default?: unknown }).default ?? mod;
    if (
      AsyncStorage &&
      typeof (AsyncStorage as { removeItem?: unknown }).removeItem === "function"
    ) {
      const asStorage = AsyncStorage as { removeItem: (k: string) => Promise<void> };
      await asStorage.removeItem(STORAGE_KEY);
      return;
    }
  } catch {
    // ignore
  }
}

export async function clearAuthSession(): Promise<void> {
  return clearAuthState();
}

const SESSION_ID_KEY = "@powerup_assessment_session_id";

export async function saveAssessmentSessionId(sessionId: string): Promise<void> {
  const SecureStore = await trySecureStoreAvailable();
  if (SecureStore && typeof (SecureStore as any).setItemAsync === "function") {
    await (SecureStore as any).setItemAsync(SESSION_ID_KEY, sessionId);
    return;
  }
  try {
    const mod = await import("@react-native-async-storage/async-storage");
    const AsyncStorage = (mod as any).default ?? mod;
    await AsyncStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch {
    // fallback to memory or ignore
  }
}

export async function getAssessmentSessionId(): Promise<string | null> {
  const SecureStore = await trySecureStoreAvailable();
  if (SecureStore && typeof (SecureStore as any).getItemAsync === "function") {
    return await (SecureStore as any).getItemAsync(SESSION_ID_KEY);
  }
  try {
    const mod = await import("@react-native-async-storage/async-storage");
    const AsyncStorage = (mod as any).default ?? mod;
    return await AsyncStorage.getItem(SESSION_ID_KEY);
  } catch {
    return null;
  }
}

export async function getUser(): Promise<User | null> {
  const session = await getAuthSession();
  return session?.user || null;
}

export async function setProfileCompletedInSession(completed: boolean): Promise<void> {
  if (!inMemorySession) {
    inMemorySession = await getAuthSession();
  }
  if (inMemorySession) {
    inMemorySession.profile_completed = completed;
    // persist
    try {
      await saveAuthSession(inMemorySession);
    } catch {
      // ignore
    }
  }
}
