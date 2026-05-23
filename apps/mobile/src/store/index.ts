import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import appReducer from "./slices/app.slice";
import onboardingReducer from "./slices/onboardingSlice";
import resumeReducer from "./slices/resume.slice";
import mockInterviewReducer from "./slices/mock-interview.slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    onboarding: onboardingReducer,
    resume: resumeReducer,
    mockInterview: mockInterviewReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
