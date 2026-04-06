import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TimeTrackingState {
  timeSpentPerModule: Record<string, number>;
}

const initialState: TimeTrackingState = {
  timeSpentPerModule: {
    grammar: 0,
    reading: 0,
    listening: 0,
    verbal: 0,
    behavioural: 0,
  },
};

const timeTrackingSlice = createSlice({
  name: "timeTracking",
  initialState,
  reducers: {
    incrementTime: (state, action: PayloadAction<{ moduleId: string; seconds: number }>) => {
      const { moduleId, seconds } = action.payload;
      if (state.timeSpentPerModule[moduleId] !== undefined) {
        state.timeSpentPerModule[moduleId] += seconds;
      } else {
        state.timeSpentPerModule[moduleId] = seconds;
      }
    },
    resetTime: (state, action: PayloadAction<string>) => {
      state.timeSpentPerModule[action.payload] = 0;
    },
  },
});

export const { incrementTime, resetTime } = timeTrackingSlice.actions;

export const selectTimeForModule = (state: any, moduleId: string) =>
  state.timeTracking.timeSpentPerModule[moduleId] || 0;

export const selectTotalTime = (state: any) =>
  Object.values(state.timeTracking.timeSpentPerModule).reduce(
    (total: any, time: any) => total + time,
    0,
  );

export default timeTrackingSlice.reducer;
