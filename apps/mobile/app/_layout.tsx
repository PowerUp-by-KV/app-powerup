/**
 * app/_layout.tsx — Root Expo Router layout
 *
 * Phase 1: Expo Router Stack navigator, mirrors old AppNavigator.
 * Phase 3: Wrapped with Redux <Provider store={store}> — all screens now
 *          have store access via useAppDispatch / useAppSelector.
 */
import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";

import store from "../src/store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="resume" options={{ title: "Resume" }} />
        <Stack.Screen name="session-picker" options={{ title: "Choose Session" }} />
        <Stack.Screen name="mock-interview/index" options={{ title: "Mock Interviews" }} />
        <Stack.Screen name="mock-interview/[sessionId]" options={{ title: "Mock Interview" }} />
        <Stack.Screen name="mock-interview/result/[sessionId]" options={{ title: "Results" }} />
        {/* Interview routes are now managed by interview/_layout.tsx */}
        <Stack.Screen
          name="interview"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </Provider>
  );
}
