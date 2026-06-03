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
import {
  getAuthSession,
  getProfileCompletedInSession,
  StoredSession,
} from "@/services/auth-storage";
import { useGetOnboardingStatusQuery } from "@/services/onboarding-api";

SplashScreen.preventAutoHideAsync();

const PUBLIC_ROUTES = ["login", "register", "otp", "splash"];
const ALLOWED_BEFORE_ONBOARDING = [
  "onboarding",
  "onboarding-resume",
  "dynamic-onboarding",
  "verify-email",
  "verify-phone",
  "thank-you",
  "welcome-back",
  "success",
];

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();

  const [session, setSession] = useState<StoredSession | null>(null);
  const [localProfileCompleted, setLocalProfileCompleted] = useState<boolean>(false);
  const [isLocalReady, setIsLocalReady] = useState(false);

  // Reload session and local completion status on route/segment changes
  useEffect(() => {
    let active = true;
    const loadLocal = async () => {
      try {
        const sess = await getAuthSession();
        const profileComp = await getProfileCompletedInSession();
        if (active) {
          setSession(sess);
          setLocalProfileCompleted(profileComp);
          setIsLocalReady(true);
        }
      } catch (err) {
        console.warn("Failed to load session in guard:", err);
        if (active) {
          setIsLocalReady(true);
        }
      }
    };
    loadLocal();
    return () => {
      active = false;
    };
  }, [segments]);

  const userId = session?.user?.id;
  const { data: onboardingStatus, isLoading: isOnboardingLoading } = useGetOnboardingStatusQuery(
    userId ?? "",
    {
      skip: !userId || localProfileCompleted,
    },
  );

  useEffect(() => {
    if (!isLocalReady) return;

    const currentRoute = segments[0] as string | undefined;
    const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);

    if (!session) {
      // User is not logged in: redirect to login if attempting to access private route
      if (!isPublic) {
        router.replace("/login");
      }
    } else {
      // User is logged in: check onboarding status
      const onboardingComplete =
        localProfileCompleted || (onboardingStatus?.answers_present ?? false);
      const isAllowedBeforeOnboarding =
        isPublic || (currentRoute && ALLOWED_BEFORE_ONBOARDING.includes(currentRoute));

      if (!onboardingComplete) {
        // If they are not onboarded, block access to tabs/dashboard
        if (!isAllowedBeforeOnboarding) {
          router.replace("/onboarding" as never);
        }
      } else {
        // If they are onboarded, block access to onboarding/login/register pages
        const routesToBlockAfterOnboarding = [
          "login",
          "register",
          "onboarding",
          "dynamic-onboarding",
        ];
        if (currentRoute && routesToBlockAfterOnboarding.includes(currentRoute)) {
          router.replace("/(tabs)/my-learning" as never);
        }
      }
    }
  }, [
    session,
    isLocalReady,
    onboardingStatus,
    isOnboardingLoading,
    localProfileCompleted,
    segments,
    router,
  ]);

  const currentRoute = segments[0] as string | undefined;
  const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);
  const isAllowedBeforeOnboarding =
    isPublic || (currentRoute && ALLOWED_BEFORE_ONBOARDING.includes(currentRoute));

  const onboardingComplete = localProfileCompleted || (onboardingStatus?.answers_present ?? false);

  if (!isLocalReady) {
    return null;
  }

  if (session && !onboardingComplete && !isAllowedBeforeOnboarding && isOnboardingLoading) {
    return null;
  }
  return <>{children}</>;
}

export default function AuthLayout() {
  const [loaded, error] = useFonts({
    Inter: Inter_400Regular,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Inter-ExtraBold": Inter_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
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
