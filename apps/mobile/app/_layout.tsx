import React from "react";
import { Stack } from "expo-router";
import { AppProviders } from "@/components/AppProviders";
import { StyleSheet } from "react-native";
import "../global.css";

// @ts-ignore - nativewind v4 / css-interop internal flag
StyleSheet.setFlag?.("darkMode", "class");

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProviders>
  );
}
