import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";
import { PHRASAL_VERBS_QUESTIONS } from "./constants/quiz-data";

export function PhrasalVerbScreen() {
  return (
    <QuizShell
      activityId={QUIZ_ACTIVITY_IDS.phrasalVerbs}
      fallbackQuestions={PHRASAL_VERBS_QUESTIONS}
    />
  );
}
