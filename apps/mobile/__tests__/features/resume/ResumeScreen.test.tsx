import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Alert } from "react-native";

import { ResumeScreen } from "../../../src/features/resume";
import profileReducer from "../../../src/store/profileSlice";

// Provide a mock for expo-document-picker
jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "file://fake/resume.pdf", name: "resume.pdf", size: 1024 }],
    }),
  ),
}));

// Mock the API slice correctly so we can spy on it
const mockTriggerUploadResume = jest.fn();
jest.mock("../../../src/services/resumeApiSlice", () => ({
  useUploadResumeMutation: () => [mockTriggerUploadResume, { isLoading: false }],
}));

// Mock Alert to prevent it blocking test flow
jest.spyOn(Alert, "alert").mockImplementation((title, msg, buttons) => {
  if (buttons && buttons.length > 0) {
    const continueBtn = buttons.find((b) => b.text === "Continue");
    if (continueBtn && continueBtn.onPress) {
      continueBtn.onPress();
    }
  }
});

const setupTestStore = () =>
  configureStore({
    reducer: {
      profile: profileReducer,
    },
  });

it("renders without crashing", async () => {
  const store = setupTestStore();

  const { getByText } = render(
    <Provider store={store}>
      <ResumeScreen />
    </Provider>,
  );

  // Component should render with the upload button
  expect(getByText("Upload Resume")).toBeTruthy();
});
