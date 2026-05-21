import { useRouter } from "expo-router";

import {
  clearAssessmentSessionId,
  clearAuthSession,
  clearProfileCompletedInSession,
  getAuthSession,
} from "@/services/auth-storage";

export const useLogout = () => {
  const router = useRouter();
  const logout = async () => {
    await clearAuthSession();
    await clearAssessmentSessionId();
    await clearProfileCompletedInSession();
    router.replace("/login");
  };
  return { logout };
};

export const getToken = async (): Promise<string | null> => {
  const session = await getAuthSession();
  return session?.access_token ?? null;
};
