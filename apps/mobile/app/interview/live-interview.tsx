/**
 * app/interview/live-interview.tsx — Live interview feedback route
 * Matches: /interview/live-interview?sessionId=...&questionId=...
 *
 * Search params:
 *   sessionId:      string  — interview session ID
 *   questionId:     string  — specific question ID
 *   questionText:   string  — question being asked
 *   questionIndex:  number  — question number for display
 */
import { Stack } from "expo-router";
import { LiveInterviewScreen } from "@/features/interview";

export default function LiveInterviewRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Interview Coach",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <LiveInterviewScreen />
    </>
  );
}
