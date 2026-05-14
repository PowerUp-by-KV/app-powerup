import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";
import { PAST_PERFECT_QUESTIONS } from "./constants/quiz-data";

export function PastPerfectQuizScreen() {
  return (
    <QuizShell
      activityId={QUIZ_ACTIVITY_IDS.pastPerfect}
      fallbackQuestions={PAST_PERFECT_QUESTIONS}
    />
  );
}
