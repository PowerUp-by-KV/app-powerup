import type {
  BuilderResume,
  BuilderContact,
  BuilderExperience,
  BuilderEducation,
  BuilderProject,
} from "../types/resume-builder.types";

interface BuiltResumeRead {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  summary?: string;
  layout?: string;
  template_name?: string;
  occupation?: string;
  experience_level?: string;
  experience?: Array<{
    id?: string;
    company?: string;
    title?: string;
    role?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    description?: string;
    highlights?: string[];
    technologies?: string[];
  }>;
  education?: Array<{
    id?: string;
    institution?: string;
    school?: string;
    degree?: string;
    field?: string;
    start_date?: string;
    end_date?: string;
    start_year?: string;
    end_year?: string;
    gpa?: string;
    location?: string;
  }>;
  projects?: Array<{
    id?: string;
    name?: string;
    date?: string;
    description?: string;
    technologies?: string[];
  }>;
  skills?: Array<string | { name: string }>;
  certifications?: Array<string | { name: string }>;
  languages?: string[];
  photo_url?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

/**
 * Normalizes a list item returned by the backend which might be a string or an object with a name property.
 */
function parseResumeItemName(val: unknown): string {
  if (typeof val === "string") return val;
  if (
    val &&
    typeof val === "object" &&
    "name" in val &&
    typeof (val as { name: unknown }).name === "string"
  ) {
    return (val as { name: string }).name;
  }
  return "";
}

/**
 * Converts the backend GET response model (BuiltResumeRead) to our clean camelCase BuilderResume interface.
 */
export function fromResumeBuilderResponse(response: unknown): BuilderResume {
  if (!response || typeof response !== "object") {
    throw new Error("No response data provided for hydration");
  }

  const res = response as BuiltResumeRead;

  // Parse experience list from backend
  const experience: BuilderExperience[] = (res.experience || []).map((exp, index) => ({
    id: exp.id || `exp-${index}-${Date.now()}`,
    company: exp.company || "",
    role: exp.title || exp.role || "",
    startDate: exp.start_date || "",
    endDate: exp.end_date || "",
    location: exp.location || "",
    description: exp.description || "",
    highlights: Array.isArray(exp.highlights) ? exp.highlights : [],
    technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
  }));

  // Parse education list from backend
  const education: BuilderEducation[] = (res.education || []).map((edu, index) => ({
    id: edu.id || `edu-${index}-${Date.now()}`,
    institution: edu.institution || edu.school || "",
    degree: edu.degree || "",
    field: edu.field || "",
    startDate: edu.start_date || "",
    endDate: edu.end_date || "",
    startYear: edu.start_year || "",
    endYear: edu.end_year || "",
    gpa: edu.gpa || "",
    location: edu.location || "",
  }));

  // Parse projects from backend
  const projects: BuilderProject[] = (res.projects || []).map((proj, index) => ({
    id: proj.id || `proj-${index}-${Date.now()}`,
    name: proj.name || "",
    date: proj.date || "",
    description: proj.description || "",
    technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
  }));

  // Map contact fields from flat response schema (BuiltResumeRead)
  const contact: BuilderContact = {
    fullName: res.full_name || res.contact?.name || "",
    email: res.email || res.contact?.email || "",
    phone: res.phone || res.contact?.phone || "",
    location: res.location || res.contact?.location || "",
    linkedin: res.linkedin_url || res.contact?.linkedin || "",
    github: res.github_url || res.contact?.github || res.contact?.portfolio || "",
  };

  console.log(
    "[RESUME BUILDER] Received from backend - raw layout:",
    res.layout,
    "raw template_name:",
    res.template_name,
  );
  return {
    contact,
    summary: res.summary || "",
    layout:
      res.layout?.toLowerCase() === "two_column" || res.layout?.toLowerCase() === "double_column"
        ? "double_column"
        : "single_column",
    templateName: res.template_name?.toLowerCase() === "modern_ats" ? "modern_ats" : "harvard",
    occupation: res.occupation || "",
    experienceLevel: res.experience_level || "",
    education,
    experience,
    skills: (res.skills || []).map(parseResumeItemName).filter(Boolean),
    projects,
    certifications: (res.certifications || []).map(parseResumeItemName).filter(Boolean),
    languages: Array.isArray(res.languages) ? res.languages : [],
    photoUrl: res.photo_url || undefined,
  };
}

/**
 * Converts the frontend clean camelCase BuilderResume model into the backend PUT body (BuiltResumeData).
 */
export function toResumeBuilderPayload(resume: BuilderResume): Record<string, unknown> {
  const payload = {
    contact: {
      name: resume.contact.fullName,
      email: resume.contact.email,
      phone: resume.contact.phone,
      linkedin: resume.contact.linkedin,
      portfolio: resume.contact.github, // maps to alias github/portfolio
      location: resume.contact.location,
    },
    summary: resume.summary || "",
    layout: resume.layout === "double_column" ? "two_column" : "single_column",
    template_name: resume.templateName === "modern_ats" ? "modern_ats" : "harvard",
    occupation: resume.occupation || null,
    experience_level: resume.experienceLevel || null,
    education: resume.education.map((edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field || "",
      start_date: edu.startDate || null,
      end_date: edu.endDate || null,
      start_year: edu.startYear || null,
      end_year: edu.endYear || null,
      gpa: edu.gpa || null,
      location: edu.location || null,
    })),
    experience: resume.experience.map((exp) => ({
      company: exp.company,
      role: exp.role, // title/role alias in backend BuiltResumeExperience
      start_date: exp.startDate || null,
      end_date: exp.endDate || null,
      location: exp.location || null,
      description: exp.description || "",
      highlights: exp.highlights || [],
      technologies: exp.technologies || [],
    })),
    skills: resume.skills,
    projects: resume.projects.map((proj) => ({
      name: proj.name,
      date: proj.date || null,
      description: proj.description || "",
      technologies: proj.technologies || [],
    })),
    certifications: resume.certifications,
    languages: resume.languages,
    photo_url: resume.photoUrl || null,
  };
  console.log(
    "[RESUME BUILDER] Sending to backend:",
    JSON.stringify({ layout: payload.layout, template_name: payload.template_name }),
  );
  return payload;
}
