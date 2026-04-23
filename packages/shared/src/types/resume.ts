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

export interface Project {
  id?: string;
  name: string;
  description?: string;
  technologies?: string[];
  link?: string;
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface Language {
  id?: string;
  name: string;
  proficiency?: string;
}

export interface ResumeParsedData {
  contact: Contact;
  summary: Summary;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  achievements?: string[];
  languages?: Language[];
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

export interface ResumeUploadResponse extends ResumeParsedData {
  id?: string;
  userId?: string;
  user_id?: string;
  file_name?: string;
  parse_status?: string;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, any>;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
  status: number;
}
