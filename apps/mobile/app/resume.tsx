/**
 * app/resume.tsx — Resume route (/resume)
 *
 * Thin wrapper for ResumeScreen.
 * No route params required — ResumeScreen manages its own upload state.
 */
import { ResumeScreen } from "@/features/resume";

export default function ResumeRoute() {
  return <ResumeScreen />;
}
