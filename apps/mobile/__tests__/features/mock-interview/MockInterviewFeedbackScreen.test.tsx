import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MockInterviewFeedbackScreen } from "@/features/mock-interview";
import mockInterviewReducer, {
  addFeedback,
  markComplete,
} from "@/store/slices/mock-interview.slice";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_FEEDBACK = {
  questionId: "q-1",
  questionText: "Tell me about a time when you had to work with a difficult team member.",
  questionOrder: 1,
  score: 8.9,
  feedback:
    "You provided a clear example with good structure. Try to add more specific details about the outcome and metrics to strengthen your answer.",
  transcript: "I once worked with a colleague who...",
  criteriaBreakdown: {
    clarity: 9.62,
    relevance: 7.92,
    confidence: 9.6,
  },
};

function makeStore() {
  return configureStore({
    reducer: { mockInterview: mockInterviewReducer },
  });
}

function renderWithStore(ui: React.ReactElement, store = makeStore()) {
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
}

function storeWithFeedback(isComplete = false) {
  const store = makeStore();
  store.dispatch(addFeedback(MOCK_FEEDBACK));
  if (isComplete) {
    store.dispatch(markComplete());
  }
  return store;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MockInterviewFeedbackScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows fallback when no feedback is in Redux (e.g. deep-link)", () => {
    const store = makeStore();
    renderWithStore(<MockInterviewFeedbackScreen />, store);

    expect(screen.getByText("No feedback available yet.")).toBeTruthy();
  });

  it("renders the score correctly", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback());

    expect(screen.getByText("8.9")).toBeTruthy();
    expect(screen.getByText("out of 10")).toBeTruthy();
  });

  it("renders the 'Great job!' label", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback());

    expect(screen.getByText("Great job!")).toBeTruthy();
  });

  it("renders all three criteria bars", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback());

    expect(screen.getByText("Clarity")).toBeTruthy();
    expect(screen.getByText("Relevance")).toBeTruthy();
    expect(screen.getByText("Confidence")).toBeTruthy();
  });

  it("renders criteria scores formatted to 2 decimal places", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback());

    expect(screen.getByText("9.62/10")).toBeTruthy();
    expect(screen.getByText("7.92/10")).toBeTruthy();
    expect(screen.getByText("9.60/10")).toBeTruthy();
  });

  it("renders the AI feedback section and text", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback());

    expect(screen.getByText("AI Feedback")).toBeTruthy();
    expect(
      screen.getByText(
        "You provided a clear example with good structure. Try to add more specific details about the outcome and metrics to strengthen your answer.",
      ),
    ).toBeTruthy();
  });

  it("shows 'Next Question' button when the session is not complete", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback(false));

    expect(screen.getByText("Next Question")).toBeTruthy();
  });

  it("shows 'View Results' button when the session is complete", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback(true));

    expect(screen.getByText("View Results")).toBeTruthy();
  });

  it("navigates to question screen when 'Next Question' is pressed", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback(false));

    fireEvent.press(screen.getByText("Next Question"));

    expect(mockReplace).toHaveBeenCalledWith("/mock-interview/question");
  });

  it("navigates to result screen when 'View Results' is pressed", () => {
    renderWithStore(<MockInterviewFeedbackScreen />, storeWithFeedback(true));

    fireEvent.press(screen.getByText("View Results"));

    expect(mockReplace).toHaveBeenCalledWith("/mock-interview/result");
  });
});
