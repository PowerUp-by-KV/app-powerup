import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { resumeApi } from "@/services/resume-api";
import appReducer from "./slices/app.slice";
import resumeReducer from "./slices/resume.slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    resume: resumeReducer,
    [api.reducerPath]: api.reducer,
    [resumeApi.reducerPath]: resumeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(resumeApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
