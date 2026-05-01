import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import appReducer from "./slices/app.slice";
import resumeReducer from "./slices/resume.slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    onboarding: onboardingReducer,
    resume: resumeReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
