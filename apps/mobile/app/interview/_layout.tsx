/**
 * app/interview/_layout.tsx — Interview group layout
 *
 * Manages interview routes:
 * - /interview/question - Question screen (with InterviewProvider)
 * - /interview/summary - Summary screen (with InterviewProvider)
 * - /interview/coach - Standalone coach flow
 * - /interview/session - Live interview with indicators
 * - Other legacy routes for backward compatibility
 */
import { Stack } from "expo-router";
import { InterviewProvider } from "@/features/interview/context/InterviewContext";

export default function InterviewLayout() {
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
        {/* Question screen — LiveInterviewScreen sets its own headerLeft dynamically */}
        <Stack.Screen
          name="question"
          options={{
            title: "Interview Question",
            headerBackVisible: false, // screen injects its own back button via <Stack.Screen>
          }}
        />

        {/* Summary screen — custom back handled inside SummaryScreen via <Stack.Screen> */}
        <Stack.Screen
          name="summary"
          options={{
            title: "Interview Results",
            headerBackVisible: false, // SummaryScreen injects its own back button
          }}
        />

        {/* Standalone Interview Coach flow (3-screen: Start → Question → Results) */}
        <Stack.Screen
          name="coach"
          options={{
            headerShown: false, // coach/_layout.tsx manages its own header
          }}
        />

        {/* Interview coach session with live indicators */}
        <Stack.Screen
          name="session"
          options={{
            title: "Interview Coach",
            headerShown: true,
          }}
        />

        {/* Per-question feedback with API */}
        <Stack.Screen
          name="feedback"
          options={{
            title: "Question Feedback",
            headerShown: true,
          }}
        />

        {/* Full detailed report — canonical route */}
        <Stack.Screen
          name="report"
          options={{
            title: "Full Report",
            headerShown: true,
          }}
        />

        {/* Full detailed report — legacy alias (keeps old deep-links working) */}
        <Stack.Screen
          name="full-report"
          options={{
            title: "Full Report",
            headerShown: true,
          }}
        />

        {/* LEGACY: Main interview session screen */}
        <Stack.Screen
          name="[sessionId]"
          options={{
            title: "Interview Coach",
            headerShown: true,
          }}
        />

        {/* LEGACY: Live interview feedback */}
        <Stack.Screen
          name="live-interview"
          options={{
            title: "Interview Coach",
            headerTitleStyle: { fontWeight: "bold" },
            headerShown: true,
          }}
        />

        {/* Model answer full-screen view */}
        <Stack.Screen
          name="model-answer"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </InterviewProvider>
  );
}
