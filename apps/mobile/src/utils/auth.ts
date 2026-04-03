import { clearAuthState, setAuthToken } from "@/services/auth-service";
import { getAuthSession } from "@/services/auth-storage";
import { useRouter } from "expo-router";

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      await clearAuthState();
      router.replace("/splash");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { logout };
};

export const getToken = async (): Promise<string | null> => {
  try {
    const session = await getAuthSession();
    return session?.access_token ?? null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    await clearAuthState();
  } catch (error) {
    console.error("Error clearing token:", error);
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    setAuthToken(token);
  } catch (error) {
    console.error("Error setting token:", error);
  }
};
