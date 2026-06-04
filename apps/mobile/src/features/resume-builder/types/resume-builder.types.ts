export interface BuilderContact {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string; // maps to backend's github/portfolio
  location: string;
}

export interface BuilderEducation {
  id: string;
  institution: string; // maps to backend's institution
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  startYear: string | number;
  endYear: string | number;
  gpa: string;
  location: string;
  [key: string]: unknown;
}

export interface BuilderExperience {
  id: string;
  company: string;
  role: string; // maps to backend's title/role
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  highlights: string[];
  technologies: string[];
  [key: string]: unknown;
}

export interface BuilderProject {
  id: string;
  name: string;
  date: string;
  description: string;
  technologies: string[];
  [key: string]: unknown;
}

export interface BuilderResume {
  contact: BuilderContact;
  summary: string;
  layout: "single_column" | "double_column";
  templateName: "harvard" | "modern_ats";
  occupation: string;
  experienceLevel: string;
  education: BuilderEducation[];
  experience: BuilderExperience[];
  skills: string[];
  projects: BuilderProject[];
  certifications: string[];
  languages: string[];
  photoUrl?: string;
}
