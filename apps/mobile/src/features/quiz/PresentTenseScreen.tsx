import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";

export function PresentTenseScreen() {
  return <QuizShell activityId={QUIZ_ACTIVITY_IDS.presentTense} />;
}
