import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";

export function PartsOfSpeechScreen() {
  return <QuizShell activityId={QUIZ_ACTIVITY_IDS.partsOfSpeech} />;
}
