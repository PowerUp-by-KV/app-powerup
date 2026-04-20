/**
 * Resume Builder Type Definitions
 * Defines all types for resume data structure
 */

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
  startDate: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
  details?: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface ResumeParsedData {
  contact: Contact;
  summary: Summary;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
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

export type ResumeStep = "contact" | "experience" | "education" | "skills";

export const RESUME_STEPS: Record<number, ResumeStep> = {
  1: "contact",
  2: "experience",
  3: "education",
  4: "skills",
};

export const STEP_LABELS: Record<ResumeStep, string> = {
  contact: "Contact & Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
};
