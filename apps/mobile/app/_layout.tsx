import "../global.css";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import {
  getAuthSession,
  StoredSession,
  getProfileCompletedInSession,
} from "@/services/auth-storage";
import { useGetOnboardingStatusQuery } from "@/services/onboarding-api";

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

// Sentinel for "no session read has completed yet". Must be distinct from every
// possible route value — including `undefined` (segments[0] is undefined on the
// first render), otherwise `readyForRoute === currentRoute` would be true before
// any read finishes and the guard could redirect prematurely.
const UNRESOLVED = Symbol("session-unresolved");

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[0] as string | undefined;

  const [session, setSession] = useState<StoredSession | null>(null);
  const [localOnboardingComplete, setLocalOnboardingComplete] = useState<boolean>(false);
  // Tracks the route for which the session read has completed. We only make
  // redirect decisions once the fresh read for the *current* route is done —
  // otherwise, right after login navigates, the effect would run with a stale
  // `session === null` and bounce the user straight back to /login. Starts as
  // UNRESOLVED (not undefined) so the first render is never considered "ready".
  const [readyForRoute, setReadyForRoute] = useState<string | undefined | typeof UNRESOLVED>(
    UNRESOLVED,
  );

  useEffect(() => {
    let active = true;
    Promise.all([getAuthSession(), getProfileCompletedInSession()])
      .then(([sess, completed]) => {
        if (!active) return;
        setSession(sess);
        setLocalOnboardingComplete(completed);
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
  }, [currentRoute]);

  // Stale while a navigation has changed the route but its session read has not
  // resolved yet — redirect logic must wait for this to become true.
  const isLocalReady = readyForRoute === currentRoute;

  const userId = session?.user?.id;
  const {
    data: onboardingStatus,
    isLoading: isOnboardingLoading,
    isFetching: isOnboardingFetching,
    isError: isOnboardingError,
  } = useGetOnboardingStatusQuery(userId ?? "", {
    skip: !userId,
  });

  useEffect(() => {
    if (!isLocalReady) return;

    const isQueryActive = !!userId;
    if (
      session &&
      isQueryActive &&
      !isOnboardingError &&
      !localOnboardingComplete &&
      (isOnboardingLoading || isOnboardingFetching || onboardingStatus === undefined)
    ) {
      return;
    }

    const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);

    if (!session) {
      if (!isPublic) router.replace("/login");
    } else {
      const onboardingComplete =
        (onboardingStatus?.answers_present ?? false) || localOnboardingComplete;

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
          router.replace("/(tabs)/my-learning" as never);
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
    localOnboardingComplete,
    currentRoute,
    segments,
    router,
  ]);

  return <>{children}</>;
}

export default function AuthLayout() {
  const [fontsLoaded, fontError] = useFonts(
    Platform.OS === "web"
      ? {}
      : {
          Inter: Inter_400Regular,
          "Inter-Regular": Inter_400Regular,
          "Inter-Medium": Inter_500Medium,
          "Inter-SemiBold": Inter_600SemiBold,
          "Inter-Bold": Inter_700Bold,
          "Inter-ExtraBold": Inter_800ExtraBold,
        },
  );

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    getAuthSession()
      .catch((err) => {
        console.warn("Failed to load session on mount:", err);
      })
      .finally(() => {
        // Always mark as checked even if SecureStore throws — prevents
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
    return null; // Splash is still visible — no black frame.
  }

  return (
    <Provider store={store}>
      <RouteGuard>
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
          <Stack.Screen name="profile" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="read" />
          <Stack.Screen name="speak-read" />
          <Stack.Screen name="listen-audio" />
          <Stack.Screen name="speak" />
          <Stack.Screen name="grammar" />
          <Stack.Screen name="listen" />
          <Stack.Screen name="results" />
          <Stack.Screen name="home" />
        </Stack>
      </RouteGuard>
    </Provider>
  );
}
