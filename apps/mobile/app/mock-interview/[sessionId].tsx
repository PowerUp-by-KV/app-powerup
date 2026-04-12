/**
 * app/mock-interview/[sessionId].tsx — Mock interview session route
 * Matches: /mock-interview/new             (new session)
 *          /mock-interview/:sessionId      (resume existing session — future use)
 *
 * Thin wrapper for MockInterviewScreen.
 *
 * Path param:
 *   sessionId — "new" when starting fresh; actual ID when resuming (reserved for Phase 4).
 *               MockInterviewScreen creates its own session via the API.
 */
import { MockInterviewScreen } from "@/features/mock-interview";

export default function MockInterviewSessionRoute() {
  return <MockInterviewScreen />;
}
