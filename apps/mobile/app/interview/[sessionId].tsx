/**
 * app/interview/[sessionId].tsx — Interview coach session route
 * Matches: /interview/:sessionId
 *
 * Thin wrapper for InterviewScreen.
 *
 * Path param:
 *   sessionId — not used by InterviewScreen directly (reserved for Phase 4 deep-linking).
 *
 * Search params (forwarded from SessionPickerScreen → bridge.navigate("Interview", ...)):
 *   candidateId:  string  — required by InterviewScreen to start the practice session
 *   resumeId:     string  — forwarded for future use
 *   type:         string  — session type ("Projects", "Experience", "Introduction")
 *   sessionTitle: string  — displayed in the screen header, e.g. "Projects Session"
 */
import { InterviewScreen } from "@/features/interview";

export default function InterviewRoute() {
  return <InterviewScreen />;
}
