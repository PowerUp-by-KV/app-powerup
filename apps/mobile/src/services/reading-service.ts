import { api } from "@/utils/api";

// Types for Reading Assessment API
export type QuestionOption = {
  id?: string;
  option_text: string;
  sort_order: number;
  is_correct: boolean;
};

export type Question = {
  id?: string;
  question_text: string;
  sort_order: number;
  points: number;
  options: QuestionOption[];
};

export type AssessmentPayload = {
  title: string;
  passage_text: string;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: Question[];
};

export type Assessment = {
  id: string;
  title: string;
  passage_text: string;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: Question[];
  created_at: string;
  updated_at: string;
};

export type ReadingAttempt = {
  id: string;
  assessment_id: string;
  user_id: string;
  user_email: string;
  started_at: string;
};

export type SubmitAttemptPayload = {
  question_id: string;
  selected_option_id: string;
}[];

// API Calls
export const fetchAssessments = async (isActive?: boolean) => {
  const params = isActive !== undefined ? { is_active: isActive } : undefined;
  const response = await api.get<Assessment[]>("/reading/assessments", { params });
  return response.data;
};

export const fetchAssessment = async (assessmentId: string) => {
  const response = await api.get<Assessment>(`/reading/assessments/${assessmentId}`);
  return response.data;
};

export const createAssessment = async (payload: AssessmentPayload) => {
  const response = await api.post<Assessment>("/reading/assessments", payload);
  return response.data;
};

export const updateAssessment = async (
  assessmentId: string,
  payload: Partial<AssessmentPayload>
) => {
  const response = await api.patch<Assessment>(
    `/reading/assessments/${assessmentId}`,
    payload
  );
  return response.data;
};

export const createReadingAttempt = async () => {
  const response = await api.post<ReadingAttempt>("/reading/attempts");
  return response.data;
};

export const submitReadingAttempt = async (
  attemptId: string,
  answers: SubmitAttemptPayload
) => {
  const response = await api.post(`/reading/attempts/${attemptId}/submit`, answers);
  return response.data;
};
