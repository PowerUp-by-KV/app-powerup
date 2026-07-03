import { useCallback, useContext } from "react";
import { useRouter, useNavigation } from "expo-router";
import * as ReactNavigation from "@react-navigation/native";
import { Platform } from "react-native";

/**
 * router.back() throws "GO_BACK was not handled" when there's no navigation
 * stack to pop (deep link, page reload). This wraps it: try back, otherwise
 * navigate to the supplied fallback (defaults to the Home tab).
 */
export function useSafeBack(fallback = "/(tabs)") {
  const router = useRouter();
  const navContext = useContext((ReactNavigation as any).NavigationContext);
  const navigation = navContext ? useNavigation() : null;

  return useCallback(() => {
    try {
      const state = navigation?.getState();
      // On Web, react-navigation's integration with browser history makes canGoBack()
      // return true even if the current stack navigator has no screens to pop.
      // Checking state.index > 0 ensures we only pop if there is actual stack history.
      const hasHistory = Platform.OS === "web" ? (state ? state.index > 0 : false) : true;

      if (
        navigation &&
        typeof navigation.canGoBack === "function" &&
        navigation.canGoBack() &&
        hasHistory
      ) {
        navigation.goBack();
      } else {
        router.replace(fallback as never);
      }
    } catch {
      router.replace(fallback as never);
    }
  }, [navigation, router, fallback]);
}
