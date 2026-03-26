import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider } from "react-redux";
import Toast from "react-native-toast-message";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/store";

import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth Stack */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Tabs Stack */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modals */}
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="onboarding" options={{ presentation: "modal" }} />
      </Stack>
      <Toast />
    </ThemeProvider>
  );
}
