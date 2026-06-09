import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  BuilderResume,
  BuilderContact,
  BuilderExperience,
  BuilderEducation,
  BuilderProject,
} from "@/features/resume-builder/types/resume-builder.types";

export interface ResumeBuilderState {
  currentStep: number;
  draftResume: BuilderResume;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  photoUrl: string | null;
  currentSubStep: number;
}

const initialState: ResumeBuilderState = {
  currentStep: 1,
  draftResume: {
    contact: {
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      location: "",
    },
    summary: "",
    layout: "single_column",
    templateName: "harvard",
    occupation: "",
    experienceLevel: "",
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  },
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  photoUrl: null,
  currentSubStep: 0,
};

export const resumeBuilderSlice = createSlice({
  name: "resumeBuilder",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    setCurrentSubStep: (state, action: PayloadAction<number>) => {
      state.currentSubStep = action.payload;
    },

    updateContact: (state, action: PayloadAction<Partial<BuilderContact>>) => {
      state.draftResume.contact = { ...state.draftResume.contact, ...action.payload };
      state.isDirty = true;
    },

    updateSummary: (state, action: PayloadAction<string>) => {
      state.draftResume.summary = action.payload;
      state.isDirty = true;
    },

    updateExperience: (state, action: PayloadAction<BuilderExperience[]>) => {
      state.draftResume.experience = action.payload;
      state.isDirty = true;
    },

    updateEducation: (state, action: PayloadAction<BuilderEducation[]>) => {
      state.draftResume.education = action.payload;
      state.isDirty = true;
    },

    updateProjects: (state, action: PayloadAction<BuilderProject[]>) => {
      state.draftResume.projects = action.payload;
      state.isDirty = true;
    },

    updateSkills: (state, action: PayloadAction<string[]>) => {
      state.draftResume.skills = action.payload;
      state.isDirty = true;
    },

    updateLanguages: (state, action: PayloadAction<string[]>) => {
      state.draftResume.languages = action.payload;
      state.isDirty = true;
    },

    updateCertifications: (state, action: PayloadAction<string[]>) => {
      state.draftResume.certifications = action.payload;
      state.isDirty = true;
    },

    updateLayoutAndTemplate: (
      state,
      action: PayloadAction<{
        layout?: "single_column" | "double_column";
        templateName?: "harvard" | "modern_ats";
        occupation?: string;
        experienceLevel?: string;
      }>,
    ) => {
      const { layout, templateName, occupation, experienceLevel } = action.payload;
      if (layout !== undefined) state.draftResume.layout = layout;
      if (templateName !== undefined) state.draftResume.templateName = templateName;
      if (occupation !== undefined) state.draftResume.occupation = occupation;
      if (experienceLevel !== undefined) state.draftResume.experienceLevel = experienceLevel;
      state.isDirty = true;
    },

    hydrateResume: (state, action: PayloadAction<BuilderResume>) => {
      state.draftResume = action.payload;
      if (action.payload.photoUrl) {
        state.photoUrl = action.payload.photoUrl;
      }
      state.isDirty = false;
    },

    markSaved: (state, action: PayloadAction<string>) => {
      state.lastSavedAt = action.payload;
      state.isDirty = false;
      state.isSaving = false;
    },

    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    setPhotoUrl: (state, action: PayloadAction<string | null>) => {
      state.photoUrl = action.payload;
      state.draftResume.photoUrl = action.payload || undefined;
      state.isDirty = true;
    },

    resetBuilderState: () => initialState,
  },
});

export const {
  setCurrentStep,
  setCurrentSubStep,
  updateContact,
  updateSummary,
  updateExperience,
  updateEducation,
  updateProjects,
  updateSkills,
  updateLanguages,
  updateCertifications,
  updateLayoutAndTemplate,
  hydrateResume,
  markSaved,
  setSaving,
  setPhotoUrl,
  resetBuilderState,
} = resumeBuilderSlice.actions;

export default resumeBuilderSlice.reducer;

// Selectors
export const selectBuilderCurrentStep = (state: { resumeBuilder: ResumeBuilderState }) =>
  state.resumeBuilder.currentStep;
export const selectBuilderCurrentSubStep = (state: { resumeBuilder: ResumeBuilderState }) =>
  state.resumeBuilder.currentSubStep;
export const selectBuilderDraft = (state: { resumeBuilder: ResumeBuilderState }) =>
  state.resumeBuilder.draftResume;
export const selectBuilderIsDirty = (state: { resumeBuilder: ResumeBuilderState }) =>
  state.resumeBuilder.isDirty;
export const selectBuilderIsSaving = (state: { resumeBuilder: ResumeBuilderState }) =>
  state.resumeBuilder.isSaving;
export const selectBuilderLastSavedAt = (state: { resumeBuilder: ResumeBuilderState }) =>
  state.resumeBuilder.lastSavedAt;
export const selectBuilderPhotoUrl = (state: { resumeBuilder: ResumeBuilderState }) =>
  state.resumeBuilder.photoUrl;
