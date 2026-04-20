/**
 * Tab Two Layout - Resume Routes
 * Handles nested navigation for resume feature
 */

import { Stack } from "expo-router";

export default function TabTwoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Resume" }} />
      <Stack.Screen name="builder" options={{ title: "Resume Builder" }} />
      <Stack.Screen name="preview" options={{ title: "Preview" }} />
    </Stack>
  );
}
