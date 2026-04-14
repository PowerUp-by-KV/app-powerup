/**
 * app/interview/coach/_layout.tsx
 *
 * Route group layout for the standalone Interview Coach flow:
 *   /interview/coach        → SessionPickerScreen
 *   /interview/coach/start  → InterviewStartScreen
 *
 * Wraps all three screens with <InterviewProvider> so the
 * useInterview state is shared across the full flow.
 */

import React from "react";
import { Stack } from "expo-router";

import { InterviewProvider } from "@/features/interview/context/InterviewContext";

export default function CoachLayout() {
  return (
    <InterviewProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#1D4ED8",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#F9FAFB" },
        }}
      >
        {/* Session picker — choose Introduction / Projects / Experience */}
        <Stack.Screen
          name="index"
          options={{
            title: "Interview Coach",
            headerBackVisible: true, // ← back → Home
          }}
        />

        {/* Start screen — shows session-specific questions preview + Start CTA */}
        <Stack.Screen
          name="start"
          options={{
            title: "Interview Coach",
            headerBackVisible: true,
          }}
        />
      </Stack>
    </InterviewProvider>
  );
}
