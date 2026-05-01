/**
 * Resume Redux Slice
 * Manages resume form state and multi-step navigation
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// Local type stubs to avoid workspace package resolution issues during local dev
type Contact = any;
type Summary = any;
type Experience = any;
type Education = any;
type Skill = any;
type ResumeParsedData = any;
type ResumeState = {
  currentStep: number;
  formData: ResumeParsedData;
  isUploading: boolean;
  isSaving: boolean;
  hasExistingResume: boolean;
  lastSaved: string | null;
  error: string | null;
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
      const index = state.formData.experience.findIndex(
        (exp: Experience) => exp.id === action.payload.id,
      );
      if (index !== -1) {
        state.formData.experience[index] = action.payload;
      }
    },

    removeExperience: (state, action: PayloadAction<string>) => {
      state.formData.experience = state.formData.experience.filter(
        (exp: Experience) => exp.id !== action.payload,
      );
    },

    addEducation: (state, action: PayloadAction<Education>) => {
      state.formData.education.push(action.payload);
    },

    updateEducation: (state, action: PayloadAction<Education>) => {
      const index = state.formData.education.findIndex(
        (edu: Education) => edu.id === action.payload.id,
      );
      if (index !== -1) {
        state.formData.education[index] = action.payload;
      }
    },

    removeEducation: (state, action: PayloadAction<string>) => {
      state.formData.education = state.formData.education.filter(
        (edu: Education) => edu.id !== action.payload,
      );
    },

    addSkill: (state, action: PayloadAction<Skill>) => {
      state.formData.skills.push(action.payload);
    },

    removeSkill: (state, action: PayloadAction<string>) => {
      state.formData.skills = state.formData.skills.filter(
        (skill: Skill) => skill.id !== action.payload,
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

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Load Resume Data
    loadResumeData: (state, action: PayloadAction<ResumeParsedData>) => {
      state.formData = action.payload;
      state.hasExistingResume = true;
      state.currentStep = 1;
    },

    // Reset
    resetResume: (state) => {
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
  setIsUploading,
  setIsSaving,
  setHasExistingResume,
  setLastSaved,
  setError,
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
export const selectIsUploading = (state: { resume: ResumeState }) => state.resume.isUploading;
export const selectIsSaving = (state: { resume: ResumeState }) => state.resume.isSaving;
export const selectHasExistingResume = (state: { resume: ResumeState }) =>
  state.resume.hasExistingResume;
export const selectLastSaved = (state: { resume: ResumeState }) => state.resume.lastSaved;
export const selectError = (state: { resume: ResumeState }) => state.resume.error;
