/**
 * app/interview/question.tsx
 * Route: /interview/question
 *
 * Interview Coach — question screen.
 * Reuses the EXISTING LiveInterviewScreen (waveform + indicators + recording)
 * in "standalone" mode. Zero new UI.
 *
 * Route params (set by InterviewStartScreen / FeedbackScreen):
 *   mode           "standalone"   ← tells LiveInterviewScreen which logic path
 *   questionIndex  string         0-based index into INTERVIEW_QUESTIONS
 *   answersJson    string         JSON array of accumulated voice answers
 *   scoresJson     string         JSON array of accumulated mock scores
 */
import { LiveInterviewScreen } from "@/features/interview/screens/LiveInterviewScreen";

export default function QuestionRoute() {
  // LiveInterviewScreen reads all params via useLocalSearchParams internally.
  // This wrapper simply mounts the screen — the mode=standalone param is pushed
  // here by InterviewStartScreen and then forwarded by each FeedbackScreen hop.
  return <LiveInterviewScreen />;
}
