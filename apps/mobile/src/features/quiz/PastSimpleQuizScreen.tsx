import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";

export function PastSimpleQuizScreen() {
  return <QuizShell activityId={QUIZ_ACTIVITY_IDS.pastSimple} />;
}
