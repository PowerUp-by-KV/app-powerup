import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";
import { PRESENT_SIMPLE_QUESTIONS } from "./constants/quiz-data";

export function PresentSimpleQuizScreen() {
  return (
    <QuizShell
      activityId={QUIZ_ACTIVITY_IDS.presentSimple}
      fallbackQuestions={PRESENT_SIMPLE_QUESTIONS}
    />
  );
}
