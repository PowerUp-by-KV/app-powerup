import { useRouter } from "expo-router";

import { store } from "@/store";
import { api } from "@/services/api";
import {
  clearAssessmentSessionId,
  clearAuthSession,
  clearProfileCompletedInSession,
  getAuthSession,
} from "@/services/auth-storage";
import { setTier } from "@/store/slices/subscription.slice";

export const useLogout = () => {
  const router = useRouter();
  const logout = async () => {
    try {
      await clearAuthSession();
      await clearAssessmentSessionId();
      await clearProfileCompletedInSession();
      store.dispatch(api.util.resetApiState());
      // resetApiState() drops the cached /subscription/current, but the tier lives in its own
      // slice — reset it too, or the next user (e.g. a free one on a shared device) inherits
      // the previous user's unlocked features until their own fetch resolves.
      store.dispatch(setTier("free"));
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
