import React from "react";
import { render, waitFor, screen } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import { HomeScreen } from "../../../src/features/home";
import profileReducer from "../../../src/store/profileSlice";

const setupTestStore = () =>
  configureStore({
    reducer: {
      profile: profileReducer,
    },
  });

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", async () => {
    const store = setupTestStore();

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "candidateId") return Promise.resolve("user-1");
      if (key === "resumeId") return Promise.resolve("resume-2");
      return Promise.resolve(null);
    });

    render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>,
    );

    // Component should render without errors
    await waitFor(() => {
      const state = store.getState().profile;
      expect(state).toBeDefined();
    });
  });

  it("handles missing AsyncStorage data properly", async () => {
    const store = setupTestStore();

    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));

    render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>,
    );

    await waitFor(() => {
      expect(store.getState().profile.resumeUploaded).toBe(false);
    });
  });
});
