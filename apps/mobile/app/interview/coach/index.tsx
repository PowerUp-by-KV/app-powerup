/**
 * app/interview/coach/index.tsx
 * Route: /interview/coach
 *
 * Session picker — user chooses Introduction, Projects, or Experience.
 * Tapping a card navigates to /interview/coach/start?sessionType=X
 * which renders InterviewStartScreen with the relevant question set.
 */
import { SessionPickerScreen } from "@/features/session-picker/SessionPickerScreen";

export default function CoachIndexRoute() {
  return <SessionPickerScreen />;
}
