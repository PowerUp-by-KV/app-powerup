import { useCallback } from "react";
import { useRouter } from "expo-router";

/**
 * router.back() throws "GO_BACK was not handled" when there's no navigation
 * stack to pop (deep link, page reload). This wraps it: try back, otherwise
 * navigate to the supplied fallback (defaults to the Home tab).
 */
export function useSafeBack(fallback = "/(tabs)") {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback as never);
    }
  }, [router, fallback]);
}
