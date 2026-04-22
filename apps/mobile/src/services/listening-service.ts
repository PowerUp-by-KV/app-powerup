export interface ListeningQuestionOption {
  id: string;
  label: string;
  is_correct: boolean;
}

export interface ListeningQuestion {
  id: string;
  question_text: string;
  points?: number;
  options: ListeningQuestionOption[];
  audio_url: string;
}

export interface ListeningAssessment {
  id: string;
  title: string;
  description: string;
  audio_url?: string;
  audio_duration_seconds?: number;
  questions: ListeningQuestion[];
}

export async function fetchListeningAssessments(_active?: boolean): Promise<ListeningAssessment[]> {
  return [
    {
      id: "listening-1",
      title: "Listening Practice",
      description: "Listen and answer the questions.",
      questions: [
        {
          id: "listen-q-1",
          question_text: "What do you hear?",
          audio_url: "",
          options: [
            { id: "listen-o-1", label: "Option 1", is_correct: true },
            { id: "listen-o-2", label: "Option 2", is_correct: false },
          ],
        },
      ],
    },
  ];
}

export async function fetchListeningAssessment(id: string): Promise<ListeningAssessment> {
  const assessments = await fetchListeningAssessments();
  const fallback: ListeningAssessment = {
    id: "listening-1",
    title: "Listening Practice",
    description: "Listen and answer the questions.",
    audio_url: "",
    audio_duration_seconds: 0,
    questions: [],
  };
  return assessments.find((assessment) => assessment.id === id) ?? fallback;
}

export async function createListeningAttempt(assessmentId: string): Promise<{ id: string }> {
  return { id: `${assessmentId}-attempt` };
}

export async function submitListeningAttempt(
  _attemptId: string,
  _answers: unknown,
): Promise<{ score: number; percentage: number; is_passed: boolean }> {
  return { score: 0, percentage: 0, is_passed: false };
}
