import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { UserProvider } from "@/features/profile/hooks/UserContext";
import { ProgressProvider } from "@/features/progress/hooks/ProgressContext";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

SplashScreen.preventAutoHideAsync();

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
      <UserProvider>
        <ProgressProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
            }}
            initialRouteName="splash"
          >
            {/* Splash -> Login -> Register -> Google-Success -> Profile -> Read -> Listen -> Write */}
            <Stack.Screen name="splash" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="success" />
            <Stack.Screen name="pre-profile-why" />
            <Stack.Screen name="pre-profile-frequency" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="dynamic-onboarding" />
            <Stack.Screen name="read" />
            <Stack.Screen name="speak-read" />
            <Stack.Screen name="listen-audio" />
            <Stack.Screen name="speak" />
            <Stack.Screen name="pre-grammer" />
            <Stack.Screen name="listen" />
            <Stack.Screen name="results" />
            <Stack.Screen name="home" />
          </Stack>
        </ProgressProvider>
      </UserProvider>
    </Provider>
  );
}
