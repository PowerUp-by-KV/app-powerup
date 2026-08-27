import "../global.css";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useFonts } from "expo-font";
import { SimpleLineIcons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "nativewind";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { AlertHost } from "@/components/AlertHost";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import { getAuthSession, StoredSession, clearAuthSession } from "@/services/auth-storage";
import { useGetOnboardingStatusQuery } from "@/services/onboarding-api";
import { useGetCurrentSubscriptionQuery } from "@/services/subscription-api";
import { useAppDispatch } from "@/store/hooks";
import { setTier, type Tier } from "@/store/slices/subscription.slice";

SplashScreen.preventAutoHideAsync();

const PUBLIC_ROUTES = ["login", "register", "otp", "splash", "verify-email", "verify-phone"];
const ALLOWED_BEFORE_ONBOARDING = [
  "onboarding",
  "onboarding-resume",
  "verify-email",
  "verify-phone",
  "thank-you",
  "welcome-back",
  "success",
  "profile",
];

function InnerRouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[0] as string | undefined;
  const dispatch = useAppDispatch();

  const [session, setSession] = useState<StoredSession | null>(null);
  // Tracks the route for which the session read has completed.
  const [readyForRoute, setReadyForRoute] = useState<string | undefined>(undefined);
  // Ensures we wait for at least one successful or failed network check before proceeding.
  const [hasStartedFetching, setHasStartedFetching] = useState(false);
  const [networkCheckComplete, setNetworkCheckComplete] = useState(false);

  useEffect(() => {
    let active = true;
    getAuthSession()
      .then((sess) => {
        if (!active) return;
        setSession(sess);
        if (sess?.tier) dispatch(setTier(sess.tier as Tier));
      })
      .catch((err) => {
        console.warn("Failed to load session in guard:", err);
      })
      .finally(() => {
        if (active) setReadyForRoute(currentRoute);
      });
    return () => {
      active = false;
    };
  }, [currentRoute, dispatch]);

  // Stale while a navigation has changed the route but its session read has not
  // resolved yet - redirect logic must wait for this to become true.
  const isLocalReady = readyForRoute === currentRoute;

  const userId = session?.user?.id;

  // Login does not return a tier, so the stored session has none and the app would
  // assume "free" on any route reached outside the (tabs) group - a deep link, a
  // notification tap, or a browser refresh on a gated screen showed paying users a
  // paywall. (tabs)/_layout already hydrates the tier this way; doing it here in the
  // root guard covers every route instead of just the tab screens.
  const { data: currentSub } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !userId,
  });

  useEffect(() => {
    if (currentSub?.tier) dispatch(setTier(currentSub.tier));
  }, [currentSub, dispatch]);

  const [cachedOnboardingComplete, setCachedOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (userId) {
      if (Platform.OS === "web") {
        const val =
          typeof window !== "undefined"
            ? window.localStorage?.getItem(`onboarding_complete_${userId}`)
            : null;
        setCachedOnboardingComplete(val === "true");
      } else {
        SecureStore.getItemAsync(`onboarding_complete_${userId}`)
          .then((val) => setCachedOnboardingComplete(val === "true"))
          .catch(() => setCachedOnboardingComplete(false));
      }
    } else {
      setCachedOnboardingComplete(null);
    }
  }, [userId]);

  const skipQuery =
    !userId || cachedOnboardingComplete === true || cachedOnboardingComplete === null;

  // Drives a retry poll once the query below has errored - see pollingInterval.
  // Starts false so the first attempt fires once, not on a timer.
  const [onboardingQueryErrored, setOnboardingQueryErrored] = useState(false);

  const {
    data: onboardingStatus,
    isLoading: isOnboardingLoading,
    isFetching: isOnboardingFetching,
    isError: isOnboardingError,
    error: onboardingError,
  } = useGetOnboardingStatusQuery(userId ?? "", {
    skip: skipQuery,
    refetchOnMountOrArgChange: true,
    // Self-heal a transient network/5xx failure (e.g. a cold-starting backend)
    // instead of leaving the user stuck on the splash screen forever - see the
    // isOnboardingError network-error branch below, which has no other retry path.
    pollingInterval: onboardingQueryErrored ? 5000 : 0,
  });

  useEffect(() => {
    setOnboardingQueryErrored(isOnboardingError);
  }, [isOnboardingError]);

  useEffect(() => {
    if (onboardingStatus?.answers_present && userId) {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined")
          window.localStorage?.setItem(`onboarding_complete_${userId}`, "true");
      } else {
        SecureStore.setItemAsync(`onboarding_complete_${userId}`, "true").catch(() => {});
      }
      setCachedOnboardingComplete(true);
    }
  }, [onboardingStatus, userId]);

  useEffect(() => {
    if (userId) {
      if (isOnboardingFetching) {
        setHasStartedFetching(true);
      } else if (hasStartedFetching) {
        setNetworkCheckComplete(true);
      }
    }
  }, [userId, isOnboardingFetching, hasStartedFetching]);

  useEffect(() => {
    if (!isLocalReady) return;
    if (userId && cachedOnboardingComplete === null) return;

    const isQueryActive = !!userId && cachedOnboardingComplete === false;
    if (
      session &&
      isQueryActive &&
      (!networkCheckComplete ||
        isOnboardingLoading ||
        isOnboardingFetching ||
        (onboardingStatus === undefined && !isOnboardingError))
    ) {
      return;
    }

    const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);

    if (isOnboardingError) {
      const isUnauthorized =
        onboardingError &&
        typeof onboardingError === "object" &&
        "status" in onboardingError &&
        (onboardingError.status === 401 || onboardingError.status === 403);

      if (isUnauthorized) {
        clearAuthSession().then(() => {
          setSession(null);
          router.replace("/login");
        });
        return;
      }

      // If it's a network error (not 401/403), we just return and wait for the pollingInterval to retry it.
      // The splash screen will stay visible.
      return;
    }

    if (!session) {
      if (!isPublic) router.replace("/login");
    } else {
      const onboardingComplete =
        cachedOnboardingComplete === true || (onboardingStatus?.answers_present ?? false);

      if (!onboardingComplete) {
        // Logged in but onboarding not complete.
        // They should only be on onboarding or verification routes.
        // If they are on a public route that is not verify-email/verify-phone (like splash, login, register), redirect to onboarding.
        if (currentRoute && !ALLOWED_BEFORE_ONBOARDING.includes(currentRoute)) {
          router.replace("/onboarding" as never);
        }
      } else {
        // Logged in and onboarding complete.
        // They should NOT be on any auth/onboarding routes (login, register, otp, splash, verify-email, verify-phone, onboarding).
        const blockedRoutes = [
          "login",
          "register",
          "otp",
          "splash",
          "verify-email",
          "verify-phone",
          "onboarding",
        ];
        if (currentRoute && blockedRoutes.includes(currentRoute)) {
          router.replace("/(tabs)" as never);
        }
      }
    }
  }, [
    session,
    readyForRoute,
    isLocalReady,
    userId,
    onboardingStatus,
    isOnboardingLoading,
    isOnboardingFetching,
    isOnboardingError,
    onboardingError,
    networkCheckComplete,
    currentRoute,
    segments,
    router,
    cachedOnboardingComplete,
  ]);

  return null;
}

function RouteGuard() {
  const rootNavigationState = useRootNavigationState();
  if (!rootNavigationState?.key) return null;
  return <InnerRouteGuard />;
}

export default function AuthLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Inter-ExtraBold": Inter_800ExtraBold,
    ...SimpleLineIcons.font,
  });

  const [authChecked, setAuthChecked] = useState(false);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let storedDarkMode: string | null = null;
        if (Platform.OS === "web" && typeof window !== "undefined") {
          storedDarkMode = window.localStorage.getItem("settings_dark_mode");
        } else if (Platform.OS !== "web") {
          storedDarkMode = await SecureStore.getItemAsync("settings_dark_mode");
        }

        const isDark = storedDarkMode === "true";
        setColorScheme(isDark ? "dark" : "light");

        if (Platform.OS === "web" && typeof document !== "undefined") {
          if (isDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } catch {
        setColorScheme("light");
        if (Platform.OS === "web" && typeof document !== "undefined") {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    loadTheme();
  }, [setColorScheme]);

  useEffect(() => {
    getAuthSession()
      .catch((err) => {
        console.warn("Failed to load session on mount:", err);
      })
      .finally(() => {
        // Always mark as checked even if SecureStore throws - prevents
        // the app being permanently stuck on the splash screen.
        setAuthChecked(true);
      });
  }, []);

  // Only hide splash once BOTH fonts and the initial auth check are done.
  useEffect(() => {
    if ((fontsLoaded || fontError) && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authChecked]);

  if ((!fontsLoaded && !fontError) || !authChecked) {
    return null; // Splash is still visible - no black frame.
  }

  return (
    <RootErrorBoundary>
      <Provider store={store}>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
          initialRouteName="splash"
        >
          <Stack.Screen name="splash" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="otp" />
          <Stack.Screen name="success" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="read" />
          <Stack.Screen name="speak-read" />
          <Stack.Screen name="listen-audio" />
          <Stack.Screen name="speak" />
          <Stack.Screen name="grammar" />
          <Stack.Screen name="listen" />
          <Stack.Screen name="results" />
          <Stack.Screen
            name="chat"
            options={{
              presentation: "transparentModal",
              animation: "fade",
            }}
          />
        </Stack>
        <RouteGuard />
        {/* Renders showAlert() dialogs on web, where React Native's Alert is a no-op. */}
        <AlertHost />
      </Provider>
    </RootErrorBoundary>
  );
}
