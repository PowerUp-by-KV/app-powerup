import { useCallback } from "react";
import { useRouter, useNavigation } from "expo-router";

/**
 * Safe back navigation helper.
 * Prevents "The action GO_BACK was not handled by any navigator" console warnings
 * when there is no navigation stack to pop (deep links, direct page reloads).
 */
export function useSafeBack(fallback = "/(tabs)") {
  const router = useRouter();
  const navigation = useNavigation();

  return useCallback(() => {
    try {
      if (typeof router.canGoBack === "function" && router.canGoBack()) {
        router.back();
        return;
      }
      const state = navigation?.getState();
      if (state && (state.index > 0 || (state.routes && state.routes.length > 1))) {
        navigation.goBack();
        return;
      }
      router.replace(fallback as never);
    } catch {
      router.replace(fallback as never);
    }
  }, [navigation, router, fallback]);
}
