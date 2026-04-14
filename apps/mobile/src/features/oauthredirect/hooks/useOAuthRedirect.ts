import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export function useOAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();

    const timeout = setTimeout(() => {
      router.replace("/google-success");
    }, 1200);

    return () => clearTimeout(timeout);
  }, [router]);

  return {
    isLoading: true,
  };
}
