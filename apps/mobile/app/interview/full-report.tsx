/**
 * app/interview/full-report.tsx — Full interview report route
 * Matches: /interview/full-report?sessionId=...
 *
 * Search params:
 *   sessionId: string  — interview session ID to fetch full report for
 */
import { FullReportScreen } from "@/features/interview";

export default function FullReportRoute() {
  return <FullReportScreen />;
}
