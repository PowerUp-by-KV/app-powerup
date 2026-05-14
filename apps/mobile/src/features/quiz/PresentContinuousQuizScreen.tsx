import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";

export function PresentContinuousQuizScreen() {
  return <QuizShell activityId={QUIZ_ACTIVITY_IDS.presentContinuous} />;
}
