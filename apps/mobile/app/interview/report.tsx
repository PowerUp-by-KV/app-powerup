/**
 * app/interview/report.tsx — Canonical full interview report route
 * Matches: /interview/report?reportId=<id>
 *
 * Search params:
 *   reportId: string  — backend session/report ID used to fetch full report data
 */
import { FullReportScreen } from "@/features/interview";

export default function ReportRoute() {
  return <FullReportScreen />;
}
