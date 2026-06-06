import "../global.css";
import { useEffect, useState } from "react";
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
import { getAuthSession, StoredSession } from "@/services/auth-storage";
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

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[0] as string | undefined;

  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLocalReady, setIsLocalReady] = useState(false);

  useEffect(() => {
    let active = true;
    getAuthSession()
      .then((sess) => {
        if (!active) return;
        setSession(sess);
      })
      .catch((err) => {
        console.warn("Failed to load session in guard:", err);
      })
      .finally(() => {
        if (active) setIsLocalReady(true);
      });
    return () => {
      active = false;
    };
  }, [currentRoute]);

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
      (isOnboardingLoading || isOnboardingFetching || onboardingStatus === undefined)
    ) {
      return;
    }

    const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);

    if (!session) {
      if (!isPublic) router.replace("/login");
    } else {
      const onboardingComplete = onboardingStatus?.answers_present ?? false;
      const isAllowedBeforeOnboarding =
        isPublic || (currentRoute && ALLOWED_BEFORE_ONBOARDING.includes(currentRoute));

      if (!onboardingComplete) {
        if (!isAllowedBeforeOnboarding) {
          router.replace("/onboarding" as never);
        }
      } else {
        const routesToBlockAfterOnboarding = ["onboarding"];
        if (currentRoute && routesToBlockAfterOnboarding.includes(currentRoute)) {
          router.replace("/(tabs)/my-learning" as never);
        }
      }
    }
  }, [
    session,
    isLocalReady,
    userId,
    onboardingStatus,
    isOnboardingLoading,
    isOnboardingFetching,
    isOnboardingError,
    currentRoute,
    segments,
    router,
  ]);

  // Only block render in the narrow window where we know the user is authenticated,
  // haven't completed onboarding, and the onboarding status is still loading.
  // In all other cases render children immediately — redirects fire via the effect above.
  // Never return null while isLocalReady is false: the splash screen is still visible then.
  const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);
  const isAllowedBeforeOnboarding =
    isPublic || (currentRoute && ALLOWED_BEFORE_ONBOARDING.includes(currentRoute));
  const onboardingComplete = onboardingStatus?.answers_present ?? false;
  const isQueryActive = !!userId;
  const isQueryLoading =
    isQueryActive &&
    (isOnboardingLoading || isOnboardingFetching || onboardingStatus === undefined);

  if (session && !onboardingComplete && !isAllowedBeforeOnboarding && isQueryLoading) {
    return null;
  }

  return <>{children}</>;
}

export default function AuthLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Inter-ExtraBold": Inter_800ExtraBold,
  });

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
