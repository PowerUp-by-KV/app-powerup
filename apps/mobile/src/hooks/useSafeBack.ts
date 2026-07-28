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
      const canBack =
        navigation?.canGoBack?.() ?? (typeof router.canGoBack === "function" && router.canGoBack());
      if (canBack) {
        navigation.goBack();
        return;
      }
      router.replace(fallback as never);
    } catch {
      router.replace(fallback as never);
    }
  }, [navigation, router, fallback]);
}
