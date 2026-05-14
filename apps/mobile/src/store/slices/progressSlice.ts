import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProgressState {
  completedDays: Record<string, number[]>; // moduleId -> array of day numbers
  completedActivities: Record<string, string[]>; // dayKey (moduleId_dayNo) -> array of activity IDs
  lastActivity: {
    moduleId: string;
    dayNo: number;
    stageId: string;
    cefrLevel: string;
    activityId: string;
    activityTitle: string;
    index: number;
  } | null;
}

const initialState: ProgressState = {
  completedDays: {
    "global-journey": [1], // Stage 1 (Pre Assesment) is completed
    m1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // All 12 sub-modules of Stage 1 are done
  },
  completedActivities: {},
  lastActivity: null,
};

export const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    completeDay: (state, action: PayloadAction<{ moduleId: string; dayNo: number }>) => {
      const { moduleId, dayNo } = action.payload;
      if (!state.completedDays[moduleId]) {
        state.completedDays[moduleId] = [];
      }
      if (!state.completedDays[moduleId].includes(dayNo)) {
        state.completedDays[moduleId].push(dayNo);
      }
    },
    completeActivity: (
      state,
      action: PayloadAction<{ moduleId: string; dayNo: number; activityId: string }>,
    ) => {
      const { moduleId, dayNo, activityId } = action.payload;
      const key = `${moduleId}_${dayNo}`;
      if (!state.completedActivities[key]) {
        state.completedActivities[key] = [];
      }
      if (!state.completedActivities[key].includes(activityId)) {
        state.completedActivities[key].push(activityId);
      }
    },
    setLastActivity: (state, action: PayloadAction<ProgressState["lastActivity"]>) => {
      state.lastActivity = action.payload;
    },
    resetProgress: (state) => {
      state.completedDays = initialState.completedDays;
      state.completedActivities = initialState.completedActivities;
      state.lastActivity = null;
    },
  },
});

export const { completeDay, completeActivity, setLastActivity, resetProgress } =
  progressSlice.actions;

export default progressSlice.reducer;
