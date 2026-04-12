/**
 * app/interview/coach/start.tsx
 * Route: /interview/coach/start?sessionType=X
 *
 * Renders the InterviewStartScreen for the selected session type.
 * sessionType is passed as a route param and forwarded to LiveInterviewScreen
 * via /interview/question when the user taps "Start Interview".
 */
import { InterviewStartScreen } from "@/features/interview/screens/InterviewStartScreen";

export default function CoachStartRoute() {
  return <InterviewStartScreen />;
}
