import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  userId: string;
  cefrLevel: string;
  token: string | null;
}

const initialState: AuthState = {
  userId: "user-1",
  cefrLevel: "A2",
  token: "mock-token",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ userId: string; token: string }>) {
      state.userId = action.payload.userId;
      state.token = action.payload.token;
    },
    setCefrLevel(state, action: PayloadAction<string>) {
      state.cefrLevel = action.payload;
    },
    logout(state) {
      state.userId = "";
      state.token = null;
    },
  },
});

export const { setAuth, setCefrLevel, logout } = authSlice.actions;

export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectCefrLevel = (state: { auth: AuthState }) => state.auth.cefrLevel;

export default authSlice.reducer;
