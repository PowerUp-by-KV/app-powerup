import "../global.css";
import { useEffect, useRef, useState } from "react";
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
import { getAuthSession } from "@/services/auth-storage";

SplashScreen.preventAutoHideAsync();

const PUBLIC_ROUTES = ["login", "register", "otp", "splash"];

function RouteGuard({
  children,
  initialAuthenticated,
}: {
  children: React.ReactNode;
  initialAuthenticated: boolean;
}) {
  const router = useRouter();
  const segments = useSegments();
  // Start with the value we already know from the pre-render auth check —
  // this prevents the blank flash on first mount.
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const hasMounted = useRef(false);

  useEffect(() => {
    // On first mount the auth state is already correct (passed from parent).
    // On subsequent segment changes we re-validate in case the session expired.
    if (!hasMounted.current) {
      hasMounted.current = true;
      const currentRoute = segments[0] as string | undefined;
      const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);
      if (!isAuthenticated && !isPublic) {
        router.replace("/login");
      }
      return;
    }

    getAuthSession().then((session) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      const currentRoute = segments[0] as string | undefined;
      const isPublic = !currentRoute || PUBLIC_ROUTES.includes(currentRoute);
      if (!authed && !isPublic) {
        router.replace("/login");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

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
  const [initialAuthenticated, setInitialAuthenticated] = useState(false);

  useEffect(() => {
    getAuthSession().then((session) => {
      setInitialAuthenticated(!!session);
      setAuthChecked(true);
    });
  }, []);

  // Only hide the splash once BOTH fonts and auth check are done.
  // Previously hideAsync fired as soon as fonts loaded, leaving a black
  // frame while the auth check was still in flight.
  useEffect(() => {
    if ((fontsLoaded || fontError) && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authChecked]);

  if ((!fontsLoaded && !fontError) || !authChecked) {
    return null; // Splash screen is still visible — no black frame.
  }

  return (
    <Provider store={store}>
      <RouteGuard initialAuthenticated={initialAuthenticated}>
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
