export type ActivityType =
  | "Template Completion"
  | "Audio Detective"
  | "Structured Recording"
  | "Reading Path Builder"
  | "Error Hunter"
  | "Speed Matching"
  | "Listen & Follow"
  | "Sound Bingo"
  | "Information Hunt"
  | string;

export type QuestionType = "writing" | "speaking" | "listening" | "reading" | "vocabulary" | string;

export interface Module {
  id: string;
  title: string;
  order_index: number;
  is_active: boolean;
}

export interface ModuleVariant {
  id: string;
  module_id: string;
  cefr_band: string;
}

export interface ModuleDay {
  id: string;
  module_id: string;
  day_number: number;
  phase: number;
  duration_hours?: number | null;
}

export interface Activity {
  id: string;
  day_id: string;
  activity_type: ActivityType;
  skill_type?: string;
  title: string | null;
  order_index: number;
  duration_hours?: number | null;
}

export interface ActivityQuestion {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: string[] | null;
  correct_answer: string | null;
  criteria: string[] | null;
  audio_url: string | null;
  scoring_rubric: unknown | null;
  cefr_level: string | null;
  order_index: number;
  is_placeholder: boolean;
}

export interface ActivitySubmitRequest {
  activity_id: string;
  answers: Array<{ question_id: string; answer: string; audio_url?: string }>;
}

export interface ActivitySubmitResponse {
  activity_id: string;
  score?: number;
  max_score?: number;
  xp_earned?: number;
  is_complete?: boolean;
}
