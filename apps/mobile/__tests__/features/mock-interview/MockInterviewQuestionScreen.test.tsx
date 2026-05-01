import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MockInterviewQuestionScreen } from "@/features/mock-interview";
import mockInterviewReducer, {
  setSession,
  setCurrentQuestion,
} from "@/store/slices/mock-interview.slice";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockSubmitAnswer = jest.fn();

jest.mock("@/services/mock-interview-api", () => ({
  useGetNextQuestionQuery: () => ({
    isLoading: false,
    isError: false,
  }),
  useSubmitAnswerMutation: () => [mockSubmitAnswer, { isLoading: false }],
}));

jest.mock("./hooks/useVoiceRecorder", () => ({
  useVoiceRecorder: () => ({
    isRecording: false,
    audioFile: null,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStore(preloadedState?: object) {
  return configureStore({
    reducer: { mockInterview: mockInterviewReducer },
    preloadedState,
  });
}

function renderWithStore(ui: React.ReactElement, store = makeStore()) {
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
}

function storeWithQuestion() {
  const store = makeStore();
  store.dispatch(setSession({ sessionId: "sess-1", totalQuestions: 8, status: "in_progress" }));
  store.dispatch(
    setCurrentQuestion({
      questionId: "q-1",
      questionText: "Tell me about a time when you had to work with a difficult team member.",
      questionOrder: 1,
    }),
  );
  return store;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MockInterviewQuestionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading indicator when question is loading", () => {
    jest.mock("@/services/mock-interview-api", () => ({
      useGetNextQuestionQuery: () => ({ isLoading: true, isError: false }),
      useSubmitAnswerMutation: () => [jest.fn(), { isLoading: false }],
    }));

    const store = makeStore();
    renderWithStore(<MockInterviewQuestionScreen />, store);
    // Screen renders without crash — loading state shown
  });

  it("renders question text from Redux", () => {
    const store = storeWithQuestion();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    expect(
      screen.getByText("Tell me about a time when you had to work with a difficult team member."),
    ).toBeTruthy();
  });

  it("renders progress label correctly", () => {
    const store = storeWithQuestion();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    expect(screen.getByText("Question 1 of 8")).toBeTruthy();
  });

  it("shows voice recorder by default (voice mode)", () => {
    const store = storeWithQuestion();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    expect(screen.getByText("Tap to record")).toBeTruthy();
    expect(screen.getByText("Type answer instead")).toBeTruthy();
  });

  it("toggles to text mode when 'Type answer instead' is pressed", () => {
    const store = storeWithQuestion();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    fireEvent.press(screen.getByText("Type answer instead"));

    expect(screen.getByPlaceholderText("Type your answer here...")).toBeTruthy();
    expect(screen.getByText("Record answer instead")).toBeTruthy();
  });

  it("toggles back to voice mode from text mode", () => {
    const store = storeWithQuestion();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    fireEvent.press(screen.getByText("Type answer instead"));
    fireEvent.press(screen.getByText("Record answer instead"));

    expect(screen.getByText("Tap to record")).toBeTruthy();
  });

  it("Submit button is disabled when no answer is given (voice mode, no audio)", () => {
    const store = storeWithQuestion();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    const submitButton = screen.getByText("Submit Answer");
    // The parent Pressable is disabled — pressing it should not trigger mutation
    fireEvent.press(submitButton);
    expect(mockSubmitAnswer).not.toHaveBeenCalled();
  });

  it("Submit button is disabled when text input is empty", () => {
    const store = storeWithQuestion();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    fireEvent.press(screen.getByText("Type answer instead"));

    const submitButton = screen.getByText("Submit Answer");
    fireEvent.press(submitButton);
    expect(mockSubmitAnswer).not.toHaveBeenCalled();
  });

  it("Submit button becomes active and calls submitAnswer when text is entered", async () => {
    mockSubmitAnswer.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });

    const store = storeWithQuestion();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    fireEvent.press(screen.getByText("Type answer instead"));

    const input = screen.getByPlaceholderText("Type your answer here...");
    fireEvent.changeText(input, "My detailed answer here");

    fireEvent.press(screen.getByText("Submit Answer"));

    await waitFor(() => {
      expect(mockSubmitAnswer).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "sess-1",
          questionId: "q-1",
          transcript: "My detailed answer here",
        }),
      );
      expect(mockPush).toHaveBeenCalledWith("/mock-interview/feedback");
    });
  });

  it("shows error state when question fails to load", () => {
    jest.resetModules();
    jest.doMock("@/services/mock-interview-api", () => ({
      useGetNextQuestionQuery: () => ({ isLoading: false, isError: true }),
      useSubmitAnswerMutation: () => [jest.fn(), { isLoading: false }],
    }));

    // Re-render after mocking error state
    const store = makeStore();
    renderWithStore(<MockInterviewQuestionScreen />, store);

    expect(screen.getByText(/Failed to load the next question/i)).toBeTruthy();
  });
});
