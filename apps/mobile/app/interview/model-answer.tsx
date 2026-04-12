/**
 * app/interview/model-answer.tsx — Model answer full-screen route
 * Matches: /interview/model-answer
 *
 * Params (all strings via router.push):
 *   question     — original interview question
 *   situation    — STAR: Situation
 *   task         — STAR: Task
 *   action       — STAR: Action
 *   result       — STAR: Result
 *   fallbackText — plain-text fallback when STAR fields are absent
 */
import { ModelAnswerScreen } from "@/features/interview/screens/ModelAnswerScreen";

export default function ModelAnswerRoute() {
  return <ModelAnswerScreen />;
}
