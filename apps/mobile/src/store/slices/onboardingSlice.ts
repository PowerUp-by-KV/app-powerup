import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OnboardingState {
  name: string;
  education: string;
  yearOfStudy: string;
  branch: string;
  dob: string;
  country: string;
  nativeLanguage: string;
  resumeUri: string | null;
  resumeName: string | null;
  englishLevel: string;
  challengingSkills: string[];
  primaryGoal: string;
  thirtyDayGoal: string;
  personalizedAreas: string[];
  dailyTime: string;
  preferredTime: string;
  streakChallenge: string;
  speakingComfort: string;
  correctionPreference: string;
  motivation: string;
  practiceBarriers: string[];
  focusTrack: string;
  dailyLearningGoal: string;
  currentStep: number;
  showDatePicker: string | boolean;
}

const initialState: OnboardingState = {
  name: "",
  education: "",
  yearOfStudy: "",
  branch: "",
  dob: "",
  country: "",
  nativeLanguage: "",
  resumeUri: null,
  resumeName: null,
  englishLevel: "",
  challengingSkills: [],
  primaryGoal: "",
  thirtyDayGoal: "",
  personalizedAreas: [],
  dailyTime: "",
  preferredTime: "",
  streakChallenge: "",
  speakingComfort: "",
  correctionPreference: "",
  motivation: "",
  practiceBarriers: [],
  focusTrack: "",
  dailyLearningGoal: "",
  currentStep: 1,
  showDatePicker: false,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    updateField: (state, action: PayloadAction<{ field: keyof OnboardingState; value: any }>) => {
      const { field, value } = action.payload;
      state[field] = value as never;
    },
    nextStep: (state) => {
      if (state.currentStep < 22) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    resetOnboarding: () => initialState,
  },
});

export const { updateField, nextStep, prevStep, setStep, resetOnboarding } =
  onboardingSlice.actions;
export default onboardingSlice.reducer;
