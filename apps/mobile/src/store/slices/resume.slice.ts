/**
 * Resume Redux Slice
 * Manages resume form state and multi-step navigation
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  ResumeState,
  Contact,
  Experience,
  Education,
  Skill,
  Project,
  Certification,
  ResumeUploadResponse,
  ResumeParsedData,
} from "@app-powerup/shared";

type ResumeLoadPayload = ResumeUploadResponse & {
  parsed_data?: ResumeParsedData;
};

type ResumeLoadData = Omit<ResumeParsedData, "contact" | "summary" | "education" | "experience"> & {
  contact: ResumeParsedData["contact"] & {
    name?: string;
  };
  summary: ResumeParsedData["summary"] | string;
  education: Array<
    Education & {
      institution?: string;
      end_year?: number | string;
      gpa?: string;
    }
  >;
  experience: Array<
    Experience & {
      title?: string;
      start_date?: string;
      end_date?: string | null;
      highlights?: string[];
    }
  >;
};

const initialState: ResumeState = {
  currentStep: 1,
  formData: {
    contact: {
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      location: "",
    },
    summary: {
      text: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    extracurricular: [],
  },
  isUploading: false,
  isSaving: false,
  hasExistingResume: false,
  lastSaved: null,
  error: null,
};

export const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    // Step Navigation
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      state.error = null;
    },

    nextStep: (state) => {
      if (state.currentStep < 4) {
        state.currentStep += 1;
        state.error = null;
      }
    },

    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
        state.error = null;
      }
    },

    // Form Data Updates
    updateContact: (state, action: PayloadAction<Partial<Contact>>) => {
      state.formData.contact = { ...state.formData.contact, ...action.payload };
    },

    updateSummary: (state, action: PayloadAction<string>) => {
      state.formData.summary.text = action.payload;
    },

    addExperience: (state, action: PayloadAction<Experience>) => {
      state.formData.experience.push(action.payload);
    },

    updateExperience: (state, action: PayloadAction<Experience>) => {
      const index = state.formData.experience.findIndex((exp) => exp.id === action.payload.id);
      if (index !== -1) {
        state.formData.experience[index] = action.payload;
      }
    },

    removeExperience: (state, action: PayloadAction<string>) => {
      state.formData.experience = state.formData.experience.filter(
        (exp) => exp.id !== action.payload,
      );
    },

    addEducation: (state, action: PayloadAction<Education>) => {
      state.formData.education.push(action.payload);
    },

    updateEducation: (state, action: PayloadAction<Education>) => {
      const index = state.formData.education.findIndex((edu) => edu.id === action.payload.id);
      if (index !== -1) {
        state.formData.education[index] = action.payload;
      }
    },

    removeEducation: (state, action: PayloadAction<string>) => {
      state.formData.education = state.formData.education.filter(
        (edu) => edu.id !== action.payload,
      );
    },

    addSkill: (state, action: PayloadAction<Skill>) => {
      state.formData.skills.push(action.payload);
    },

    removeSkill: (state, action: PayloadAction<string>) => {
      state.formData.skills = state.formData.skills.filter((skill) => skill.id !== action.payload);
    },

    addProject: (state, action: PayloadAction<Project>) => {
      state.formData.projects = state.formData.projects || [];
      state.formData.projects.push(action.payload);
    },

    updateProject: (state, action: PayloadAction<Project>) => {
      if (!state.formData.projects) return;
      const index = state.formData.projects.findIndex(
        (proj) => proj.id === action.payload.id || proj.name === action.payload.name,
      );
      if (index !== -1) {
        state.formData.projects[index] = action.payload;
      }
    },

    removeProject: (state, action: PayloadAction<string>) => {
      if (!state.formData.projects) return;
      state.formData.projects = state.formData.projects.filter(
        (proj) => proj.id !== action.payload && proj.name !== action.payload,
      );
    },

    addCertification: (state, action: PayloadAction<Certification>) => {
      state.formData.certifications = state.formData.certifications || [];
      state.formData.certifications.push(action.payload);
    },

    updateCertification: (state, action: PayloadAction<Certification>) => {
      if (!state.formData.certifications) return;
      const index = state.formData.certifications.findIndex(
        (cert) => cert.id === action.payload.id || cert.name === action.payload.name,
      );
      if (index !== -1) {
        state.formData.certifications[index] = action.payload;
      }
    },

    removeCertification: (state, action: PayloadAction<string>) => {
      if (!state.formData.certifications) return;
      state.formData.certifications = state.formData.certifications.filter(
        (cert) => cert.id !== action.payload && cert.name !== action.payload,
      );
    },

    // Upload/Save State
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },

    setIsSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    setHasExistingResume: (state, action: PayloadAction<boolean>) => {
      state.hasExistingResume = action.payload;
    },

    setLastSaved: (state, action: PayloadAction<string | null>) => {
      state.lastSaved = action.payload;
    },

    // Error Handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Load Resume Data
    loadResumeData: (state, action: PayloadAction<ResumeLoadPayload>) => {
      const payload = action.payload;

      // Extract parsed_data if it exists (from API response), otherwise use payload directly
      const data = (payload?.parsed_data || payload) as ResumeLoadData;

      state.formData = {
        contact: {
          fullName: data.contact?.name || data.contact?.fullName || "",
          email: data.contact?.email || "",
          phone: data.contact?.phone || "",
          linkedin: data.contact?.linkedin || "",
          location: data.contact?.location || "",
        },
        summary:
          typeof data.summary === "string" ? { text: data.summary } : data.summary || { text: "" },
        education: (data.education || []).map((edu, i) => ({
          id: edu.id || `edu-${Date.now()}-${i}`,
          school: edu.institution || edu.school || "",
          degree: edu.degree || "",
          field: edu.field || "",
          graduationDate: edu.end_year ? edu.end_year.toString() : edu.graduationDate || "",
          details: edu.gpa ? `GPA: ${edu.gpa}` : edu.details || "",
        })),
        experience: (data.experience || []).map((exp, i) => ({
          id: exp.id || `exp-${Date.now()}-${i}`,
          company: exp.company || "",
          position: exp.title || exp.position || "",
          startDate: exp.start_date || exp.startDate || "",
          endDate: exp.end_date || exp.endDate || "",
          currentlyWorking: !exp.end_date && !exp.endDate,
          description: exp.description || (exp.highlights ? exp.highlights.join("\n") : ""),
        })),
        skills: (data.skills || []).map((skill, i) => {
          if (typeof skill === "string") return { id: `skill-${Date.now()}-${i}`, name: skill };
          return skill;
        }),
        projects: (data.projects || []).map((proj, i) => ({
          id: proj.id || `proj-${Date.now()}-${i}`,
          name: proj.name || "",
          description: proj.description || "",
          technologies: proj.technologies || [],
        })),
        certifications: (data.certifications || []).map((cert, i) => {
          if (typeof cert === "string")
            return { id: `cert-${Date.now()}-${i}`, name: cert, issuer: "" };
          return cert;
        }),
        achievements: data.achievements || [],
        languages: data.languages || [],
        extracurricular: data.extracurricular || [],
      };

      state.hasExistingResume = true;
      state.currentStep = 1;
      state.error = null;
    },

    // Reset
    resetResume: () => {
      return initialState;
    },
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  updateContact,
  updateSummary,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addSkill,
  removeSkill,
  addProject,
  updateProject,
  removeProject,
  addCertification,
  updateCertification,
  removeCertification,
  setIsUploading,
  setIsSaving,
  setHasExistingResume,
  setLastSaved,
  setError,
  clearError,
  loadResumeData,
  resetResume,
} = resumeSlice.actions;

export default resumeSlice.reducer;

// Selectors
export const selectCurrentStep = (state: { resume: ResumeState }) => state.resume.currentStep;
export const selectFormData = (state: { resume: ResumeState }) => state.resume.formData;
export const selectContact = (state: { resume: ResumeState }) => state.resume.formData.contact;
export const selectSummary = (state: { resume: ResumeState }) => state.resume.formData.summary;
export const selectExperience = (state: { resume: ResumeState }) =>
  state.resume.formData.experience;
export const selectEducation = (state: { resume: ResumeState }) => state.resume.formData.education;
export const selectSkills = (state: { resume: ResumeState }) => state.resume.formData.skills;
export const selectProjects = (state: { resume: ResumeState }) => state.resume.formData.projects;
export const selectCertifications = (state: { resume: ResumeState }) =>
  state.resume.formData.certifications;
export const selectIsUploading = (state: { resume: ResumeState }) => state.resume.isUploading;
export const selectIsSaving = (state: { resume: ResumeState }) => state.resume.isSaving;
export const selectHasExistingResume = (state: { resume: ResumeState }) =>
  state.resume.hasExistingResume;
export const selectLastSaved = (state: { resume: ResumeState }) => state.resume.lastSaved;
export const selectError = (state: { resume: ResumeState }) => state.resume.error;
