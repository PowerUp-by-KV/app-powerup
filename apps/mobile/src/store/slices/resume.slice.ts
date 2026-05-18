/**
 * Resume Redux Slice
 * Manages resume form state and multi-step navigation
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  ResumeParsedData,
  Contact,
  Experience,
  Education,
  Skill,
  Project,
  Certification,
} from "@/services/resume-api";

export interface ResumeState {
  currentStep: number;
  formData: ResumeParsedData;
  isUploading: boolean;
  isSaving: boolean;
  hasExistingResume: boolean;
  lastSaved: string | null;
  error: string | null;
}

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

    updateContact: (state, action: PayloadAction<Partial<Contact>>) => {
      state.formData.contact = { ...state.formData.contact, ...action.payload };
    },

    updateSummary: (state, action: PayloadAction<string>) => {
      if (!state.formData.summary) {
        state.formData.summary = { text: action.payload };
      } else {
        state.formData.summary.text = action.payload;
      }
    },

    addExperience: (state, action: PayloadAction<Experience>) => {
      if (!state.formData.experience) state.formData.experience = [];
      state.formData.experience.push(action.payload);
    },

    updateExperience: (state, action: PayloadAction<Experience>) => {
      if (!state.formData.experience) return;
      const index = state.formData.experience.findIndex(
        (exp: Experience) => exp.id === action.payload.id,
      );
      if (index !== -1) {
        state.formData.experience[index] = action.payload;
      }
    },

    removeExperience: (state, action: PayloadAction<string>) => {
      if (!state.formData.experience) return;
      state.formData.experience = state.formData.experience.filter(
        (exp: Experience) => exp.id !== action.payload,
      );
    },

    addEducation: (state, action: PayloadAction<Education>) => {
      if (!state.formData.education) state.formData.education = [];
      state.formData.education.push(action.payload);
    },

    updateEducation: (state, action: PayloadAction<Education>) => {
      if (!state.formData.education) return;
      const index = state.formData.education.findIndex(
        (edu: Education) => edu.id === action.payload.id,
      );
      if (index !== -1) {
        state.formData.education[index] = action.payload;
      }
    },

    removeEducation: (state, action: PayloadAction<string>) => {
      if (!state.formData.education) return;
      state.formData.education = state.formData.education.filter(
        (edu: Education) => edu.id !== action.payload,
      );
    },

    addSkill: (state, action: PayloadAction<Skill>) => {
      if (!state.formData.skills) state.formData.skills = [];
      state.formData.skills.push(action.payload);
    },

    removeSkill: (state, action: PayloadAction<string>) => {
      if (!state.formData.skills) return;
      state.formData.skills = state.formData.skills.filter((skill: Skill | string) => {
        if (typeof skill === "string") return true;
        return skill.id !== action.payload;
      });
    },

    addProject: (state, action: PayloadAction<Project>) => {
      if (!state.formData.projects) state.formData.projects = [];
      state.formData.projects.push(action.payload);
    },

    updateProject: (state, action: PayloadAction<Project>) => {
      if (!state.formData.projects) return;
      const index = state.formData.projects.findIndex(
        (proj: Project) => proj.id === action.payload.id || proj.name === action.payload.name,
      );
      if (index !== -1) {
        state.formData.projects[index] = action.payload;
      }
    },

    removeProject: (state, action: PayloadAction<string>) => {
      if (!state.formData.projects) return;
      state.formData.projects = state.formData.projects.filter(
        (proj: Project) => proj.id !== action.payload && proj.name !== action.payload,
      );
    },

    addCertification: (state, action: PayloadAction<Certification>) => {
      if (!state.formData.certifications) state.formData.certifications = [];
      state.formData.certifications.push(action.payload);
    },

    removeCertification: (state, action: PayloadAction<string>) => {
      if (!state.formData.certifications) return;
      state.formData.certifications = state.formData.certifications.filter(
        (cert: Certification | string) => {
          if (typeof cert === "string") return true;
          return cert.id !== action.payload && cert.name !== action.payload;
        },
      );
    },

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

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    loadResumeData: (state, action: PayloadAction<ResumeParsedData>) => {
      state.formData = action.payload;
      state.hasExistingResume = true;
      state.currentStep = 1;
    },

    resetResume: () => initialState,
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
  removeCertification,
  setIsUploading,
  setIsSaving,
  setHasExistingResume,
  setLastSaved,
  setError,
  loadResumeData,
  resetResume,
} = resumeSlice.actions;

export default resumeSlice.reducer;

export const selectCurrentStep = (state: { resume: ResumeState }) => state.resume.currentStep;
export const selectFormData = (state: { resume: ResumeState }) => state.resume.formData;
export const selectContact = (state: { resume: ResumeState }) => state.resume.formData.contact;
export const selectSummary = (state: { resume: ResumeState }) => state.resume.formData.summary;
export const selectExperience = (state: { resume: ResumeState }) =>
  state.resume.formData.experience;
export const selectEducation = (state: { resume: ResumeState }) => state.resume.formData.education;

export const selectSkills = (state: { resume: ResumeState }): Skill[] => {
  const skills = state.resume.formData.skills || [];
  return skills.map((s) => (typeof s === "string" ? { id: s, name: s } : s));
};

export const selectProjects = (state: { resume: ResumeState }): Project[] => {
  return state.resume.formData.projects || [];
};

export const selectCertifications = (state: { resume: ResumeState }): Certification[] => {
  const certs = state.resume.formData.certifications || [];
  return certs.map((c) => (typeof c === "string" ? { id: c, name: c } : c));
};

export const selectIsUploading = (state: { resume: ResumeState }) => state.resume.isUploading;
export const selectIsSaving = (state: { resume: ResumeState }) => state.resume.isSaving;
export const selectHasExistingResume = (state: { resume: ResumeState }) =>
  state.resume.hasExistingResume;
export const selectLastSaved = (state: { resume: ResumeState }) => state.resume.lastSaved;
export const selectError = (state: { resume: ResumeState }) => state.resume.error;
