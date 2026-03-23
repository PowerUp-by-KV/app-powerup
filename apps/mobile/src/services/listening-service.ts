import { api } from "@/utils/api";

// Types for Listening Assessment API
export type ListeningQuestionOption = {
  id?: string;
  option_text: string;
  sort_order: number;
  is_correct: boolean;
};

export type ListeningQuestion = {
  id?: string;
  question_text: string;
  sort_order: number;
  points: number;
  options: ListeningQuestionOption[];
};

export type ListeningAssessmentPayload = {
  title: string;
  description: string;
  instructions: string;
  audio_url: string;
  audio_duration_seconds: number;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: ListeningQuestion[];
};

export type ListeningAssessment = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  audio_url: string;
  audio_duration_seconds: number;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: ListeningQuestion[];
  created_at: string;
  updated_at: string;
};

export type ListeningAttempt = {
  id: string;
  assessment_id: string;
  user_id: string;
  user_email: string;
  started_at: string;
};

export type SubmitListeningAttemptPayload = {
  question_id: string;
  selected_option_id: string;
}[];

// API Calls
export const fetchListeningAssessments = async (isActive?: boolean) => {
  const params = isActive !== undefined ? { is_active: isActive } : undefined;
  const response = await api.get<ListeningAssessment[]>("/listening/assessments", { params });
  return response.data;
};

export const fetchListeningAssessment = async (assessmentId: string) => {
  const response = await api.get<ListeningAssessment>(`/listening/assessments/${assessmentId}`);
  return response.data;
};

export const createListeningAssessment = async (payload: ListeningAssessmentPayload) => {
  const response = await api.post<ListeningAssessment>("/listening/assessments", payload);
  return response.data;
};

export const updateListeningAssessment = async (
  assessmentId: string,
  payload: Partial<ListeningAssessmentPayload>
) => {
  const response = await api.patch<ListeningAssessment>(
    `/listening/assessments/${assessmentId}`,
    payload
  );
  return response.data;
};

export const createListeningAttempt = async (assessmentId: string) => {
  const response = await api.post<ListeningAttempt>("/listening/attempts", {
    assessment_id: assessmentId,
  });
  return response.data;
};

export const submitListeningAttempt = async (
  attemptId: string,
  answers: SubmitListeningAttemptPayload
) => {
  const response = await api.post(
    `/listening/attempts/${attemptId}/submit`,
    answers
  );
  return response.data;
};
