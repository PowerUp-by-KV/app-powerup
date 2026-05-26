import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  isOnboarded: boolean;
  theme: "light" | "dark" | "system";
}

const initialState: AppState = {
  isOnboarded: false,
  theme: "system",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setOnboarded(state, action: PayloadAction<boolean>) {
      state.isOnboarded = action.payload;
    },
    setTheme(state, action: PayloadAction<AppState["theme"]>) {
      state.theme = action.payload;
    },
  },
});

export const { setOnboarded, setTheme } = appSlice.actions;
export default appSlice.reducer;
