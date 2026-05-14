import { QuizShell } from "./components/QuizShell";
import { QUIZ_ACTIVITY_IDS } from "./constants/activity-ids";
import { MODAL_VERBS_QUESTIONS } from "./constants/quiz-data";

export function ModalVerbsScreen() {
  return (
    <QuizShell
      activityId={QUIZ_ACTIVITY_IDS.modalVerbs}
      fallbackQuestions={MODAL_VERBS_QUESTIONS}
    />
  );
}
