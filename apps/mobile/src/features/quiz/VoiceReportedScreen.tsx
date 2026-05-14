import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";

export function VoiceReportedScreen() {
  return <QuizShell activityId={QUIZ_ACTIVITY_IDS.voiceReported} />;
}
