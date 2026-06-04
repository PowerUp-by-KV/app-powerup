import { useRouter } from "expo-router";

import { store } from "@/store";
import { api } from "@/services/api";
import {
  clearAssessmentSessionId,
  clearAuthSession,
  clearProfileCompletedInSession,
  getAuthSession,
} from "@/services/auth-storage";

export const useLogout = () => {
  const router = useRouter();
  const logout = async () => {
    try {
      await clearAuthSession();
      await clearAssessmentSessionId();
      await clearProfileCompletedInSession();
      store.dispatch(api.util.resetApiState());
      router.replace("/login");
    } catch {}
  };
  return { logout };
};

export const getToken = async (): Promise<string | null> => {
  try {
    const session = await getAuthSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    await clearAuthSession();
  } catch {}
};
