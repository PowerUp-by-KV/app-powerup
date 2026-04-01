import { api } from "@/utils/api";

// Types for Grammar Assessment API
export type GrammarQuestionOption = {
  id?: string;
  option_text: string;
  sort_order: number;
  is_correct: boolean;
};

export type GrammarQuestion = {
  id?: string;
  question_text: string;
  sort_order: number;
  points: number;
  options: GrammarQuestionOption[];
};

export type GrammarAssessmentPayload = {
  title: string;
  description: string;
  instructions: string;
  topic: string;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: GrammarQuestion[];
};

export type GrammarAssessment = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  topic: string;
  total_questions: number;
  time_limit_seconds: number;
  is_active: boolean;
  questions: GrammarQuestion[];
  created_at: string;
  updated_at: string;
};

export type GrammarAttempt = {
  id: string;
  assessment_id: string;
  user_id: string;
  user_email: string;
  started_at: string;
};

export type SubmitGrammarAttemptPayload = {
  question_id: string;
  answer_text: string;
}[];

// API Calls
export const fetchGrammarAssessments = async (isActive?: boolean) => {
  const params = isActive !== undefined ? { is_active: isActive } : undefined;
  const response = await api.get<GrammarAssessment[]>("/grammar/assessments", { params });
  return response.data;
};

export const fetchGrammarAssessment = async (assessmentId: string) => {
  const response = await api.get<GrammarAssessment>(`/grammar/assessments/${assessmentId}`);
  return response.data;
};

export const createGrammarAssessment = async (payload: GrammarAssessmentPayload) => {
  const response = await api.post<GrammarAssessment>("/grammar/assessments", payload);
  return response.data;
};

export const updateGrammarAssessment = async (
  assessmentId: string,
  payload: Partial<GrammarAssessmentPayload>
) => {
  const response = await api.patch<GrammarAssessment>(
    `/grammar/assessments/${assessmentId}`,
    payload
  );
  return response.data;
};

export const createGrammarAttempt = async (assessmentId: string) => {
  const response = await api.post<GrammarAttempt>("/grammar/attempts", {
    assessment_id: assessmentId,
  });
  return response.data;
};

export const submitGrammarAttempt = async (
  attemptId: string,
  answers: SubmitGrammarAttemptPayload
) => {
  const response = await api.post(
    `/grammar/attempts/${attemptId}/submit`,
    answers
  );
  return response.data;
};
