/**
 * Resume Route Layout
 * Expo Router configuration for resume feature routes
 */

import { Stack } from "expo-router";

export default function ResumeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My Resume",
        }}
      />
      <Stack.Screen
        name="builder"
        options={{
          title: "Resume Builder",
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          title: "Resume Preview",
        }}
      />
    </Stack>
  );
}
