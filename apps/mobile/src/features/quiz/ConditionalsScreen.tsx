import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";
import { CONDITIONALS_QUESTIONS } from "./constants/quiz-data";

export function ConditionalsScreen() {
  return (
    <QuizShell
      activityId={QUIZ_ACTIVITY_IDS.conditionals}
      fallbackQuestions={CONDITIONALS_QUESTIONS}
    />
  );
}
