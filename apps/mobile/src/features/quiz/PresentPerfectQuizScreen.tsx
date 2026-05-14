import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";

export function PresentPerfectQuizScreen() {
  return <QuizShell activityId={QUIZ_ACTIVITY_IDS.presentPerfect} />;
}
