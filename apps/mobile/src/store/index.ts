import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import appReducer from "./slices/app.slice";
import onboardingReducer from "./slices/onboardingSlice";
import authReducer from "./slices/authSlice";
import progressReducer from "./slices/progressSlice";
import resumeReducer from "./slices/resume.slice";
import timeTrackingReducer from "./slices/timeTrackingSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    onboarding: onboardingReducer,
    auth: authReducer,
    progress: progressReducer,
    resume: resumeReducer,
    timeTracking: timeTrackingReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
