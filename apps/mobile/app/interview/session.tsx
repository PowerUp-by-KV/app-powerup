/**
 * app/interview/session.tsx
 * Interview Coach Session Route
 * Renders InterviewScreen with full-width UI matching MockInterviewScreen
 * Includes live indicators polling every 1.5 seconds
 */
import { InterviewScreen } from "@/features/interview";

export default function InterviewCoachRoute() {
  return <InterviewScreen />;
}
