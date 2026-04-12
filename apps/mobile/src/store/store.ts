/**
 * src/store/store.ts
 *
 * Redux store instance and AppDispatch type export.
 */

import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "@/store/rootReducer";
import { resumeApi } from "@/services/resumeApiSlice";
import { practiceApi } from "@/services/practiceApiSlice";
import { interviewApi } from "@/services/interviewApiSlice";
import { mockInterviewApi } from "@/services/mockInterviewApiSlice";
import { interviewFeedbackApi } from "@/features/interview/services/interviewFeedbackApi";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(resumeApi.middleware)
      .concat(practiceApi.middleware)
      .concat(interviewApi.middleware)
      .concat(mockInterviewApi.middleware)
      .concat(interviewFeedbackApi.middleware),
});

/** Inferred dispatch type — includes RTK Query thunks. */
export type AppDispatch = typeof store.dispatch;

export default store;
