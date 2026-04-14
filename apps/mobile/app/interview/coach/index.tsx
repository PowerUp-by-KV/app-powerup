/**
 * app/interview/coach/index.tsx
 * Route: /interview/coach
 *
 * Session picker — user chooses Introduction, Projects, or Experience.
 * Tapping a card navigates to /interview/question?sessionType=X
 * which renders QuestionScreen with the relevant question set.
 */
import { SessionPickerScreen } from "@/features/session-picker/SessionPickerScreen";

export default function CoachIndexRoute() {
  return <SessionPickerScreen />;
}
