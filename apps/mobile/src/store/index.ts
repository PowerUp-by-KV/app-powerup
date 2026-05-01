import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import appReducer from "./slices/app.slice";
import onboardingReducer from "./slices/onboardingSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    onboarding: onboardingReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
