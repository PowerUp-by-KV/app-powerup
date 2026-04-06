export interface QuestionOption {
  id: string;
  label: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  question_text: string;
  points?: number;
  options: QuestionOption[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  passage_text?: string;
  questions: Question[];
}

export async function fetchReadingAssessments(_active?: boolean): Promise<Assessment[]> {
  return [
    {
      id: "reading-1",
      title: "Reading Practice",
      description: "Answer the reading comprehension questions.",
      questions: [
        {
          id: "read-q-1",
          question_text: "What is the main idea of the passage?",
          points: 1,
          options: [
            { id: "read-o-1", label: "Option A", is_correct: true },
            { id: "read-o-2", label: "Option B", is_correct: false },
          ],
        },
      ],
    },
  ];
}

export async function fetchReadingAssessment(id: string): Promise<Assessment> {
  const assessments = await fetchReadingAssessments();
  const fallback: Assessment = {
    id: "reading-1",
    title: "Reading Practice",
    description: "Answer the reading comprehension questions.",
    passage_text: "",
    questions: [],
  };
  return assessments.find((assessment) => assessment.id === id) ?? fallback;
}

export async function createReadingAttempt(assessmentId: string): Promise<{ id: string }> {
  return { id: `${assessmentId}-attempt` };
}

export async function submitReadingAttempt(
  _attemptId: string,
  _answers: unknown,
): Promise<{ score: number; percentage: number; is_passed: boolean }> {
  return { score: 0, percentage: 0, is_passed: false };
}

export const fetchAssessments = fetchReadingAssessments;
export const fetchAssessment = fetchReadingAssessment;
