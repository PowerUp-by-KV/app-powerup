/* eslint-disable @typescript-eslint/no-explicit-any */
// Unified Shared Types for PowerUp Application

export interface Module {
  id: string;
  title: string;
  order_index: number;
  is_active: boolean;
}

export interface ModuleVariant {
  id: string;
  cefr_level: string;
}

export interface ModuleDay {
  id: string;
  day_number: number;
  duration_hours: number | null;
  is_completed: boolean;
  topic?: string | null;
  completed_activities?: number;
  total_activities?: number;
  progress_percentage?: number;
}

export interface Activity {
  id: string;
  skill_type: string; // e.g. listening, reading, vocabulary, speaking
  activity_type: string; // e.g. mcq, speaking, fill_blank, writing
  order_index: number;
  duration_hours: number | null;
  status: "not_started" | "in_progress" | "completed";
  score: number | null;
  passed: boolean;
  content?: Record<string, unknown>;
  image_url?: string | null;
  media_urls?: Record<string, any> | string[] | null;
  metadata?: Record<string, any> | null;
}

export interface ActivityQuestion {
  id: string;
  question_text: string;
  question_type: string | null;
  options: Array<{ id: string; text: string } | string> | null;
  correct_answer: string | null;
  criteria: string[] | null;
  audio_url: string | null;
  scoring_rubric: Record<string, any> | null;
  cefr_level: string;
  order_index: number;
  is_placeholder: boolean;
  content?: {
    left_items?: string[];
    right_items?: string[];
    image_url?: string;
    [key: string]: any;
  } | null;
  evaluation?: { matches?: Record<string, string>; [key: string]: any } | null;
  image_url?: string | null;
  media_urls?: Record<string, any> | string[] | null;
  metadata?: Record<string, any> | null;
}

export interface ActivitySubmitResponse {
  success: boolean;
  score?: number;
  passed: boolean;
  feedback?: string;
}

// ── Resume Studio Types ──────────────────────────────────────────────────

export interface Contact {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
}

export interface Summary {
  text: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface ResumeParsedData {
  contact: Contact;
  summary: Summary;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  extracurricular?: string[];
}

export interface ResumeState {
  currentStep: number;
  formData: ResumeParsedData;
  isUploading: boolean;
  isSaving: boolean;
  hasExistingResume: boolean;
  lastSaved: string | null;
  error: string | null;
}

// ── Resume Constants ──────────────────────────────────────────────────────

export const RESUME_STEPS = {
  1: "contact",
  2: "summary",
  3: "experience",
  4: "education",
  5: "skills",
} as const;

export const STEP_LABELS = {
  contact: "Contact Info",
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills & Projects",
} as const;

// ── Additional Shared Helpers & Constants ─────────────────────────────────

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}
