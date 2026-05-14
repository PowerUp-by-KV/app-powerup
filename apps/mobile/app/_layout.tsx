import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { AppProvider } from "../src/hooks/AppContext";
import { UserProvider } from "@/features/profile/hooks/UserContext";
import { ProgressProvider } from "@/features/progress/hooks/ProgressContext";
import { StyleSheet } from "react-native";
import "../global.css";

// @ts-expect-error - nativewind v4 / css-interop internal flag
StyleSheet.setFlag?.("darkMode", "class");

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserProvider>
          <AppProvider>
            <ProgressProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </ProgressProvider>
          </AppProvider>
        </UserProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
