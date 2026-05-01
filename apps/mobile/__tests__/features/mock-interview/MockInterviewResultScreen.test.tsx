import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MockInterviewResultScreen } from "@/features/mock-interview";
import mockInterviewReducer, {
  setSession,
  setFinalResult,
} from "@/store/slices/mock-interview.slice";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const MOCK_RESULTS = {
  session: {
    id: "sess-1",
    status: "completed",
    total_questions: 8,
    created_at: "2026-04-28T10:00:00Z",
  },
  overall_score: 9.0,
  grade: "Very Good",
  answers: [
    {
      question_id: "q-1",
      question_text: "Tell me about a time when you had to work with a difficult team member.",
      question_order: 1,
      transcript: "I once worked with a colleague who had a very different work style...",
      score: 8.88,
      feedback: "Good use of the STAR method.",
      criteria_breakdown: { clarity: 9.0, relevance: 8.5, confidence: 9.1 },
    },
    {
      question_id: "q-2",
      question_text: "How do you prioritize tasks when managing multiple projects?",
      question_order: 2,
      transcript: "I use a priority matrix...",
      score: 9.37,
      feedback: "Excellent structure and concrete examples.",
      criteria_breakdown: { clarity: 9.5, relevance: 9.2, confidence: 9.4 },
    },
  ],
};

jest.mock("@/services/mock-interview-api", () => ({
  useGetInterviewResultsQuery: () => ({
    data: MOCK_RESULTS,
    isLoading: false,
    isError: false,
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStore() {
  return configureStore({
    reducer: { mockInterview: mockInterviewReducer },
  });
}

function renderWithStore(ui: React.ReactElement, store = makeStore()) {
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
}

function storeWithSession() {
  const store = makeStore();
  store.dispatch(setSession({ sessionId: "sess-1", totalQuestions: 8, status: "completed" }));
  store.dispatch(setFinalResult({ score: 9.0, grade: "Very Good" }));
  return store;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MockInterviewResultScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Interview Complete heading", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    expect(screen.getByText("Interview Complete!")).toBeTruthy();
  });

  it("renders the final score", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    expect(screen.getByText("9.0/10")).toBeTruthy();
  });

  it("renders the grade label", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    expect(screen.getByText("Very Good")).toBeTruthy();
  });

  it("renders the 'Your Responses' section header", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    expect(screen.getByText("Your Responses")).toBeTruthy();
  });

  it("renders all question accordion rows", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    expect(screen.getByText("Q1")).toBeTruthy();
    expect(screen.getByText("Q2")).toBeTruthy();
    expect(
      screen.getByText("Tell me about a time when you had to work with a difficult team member."),
    ).toBeTruthy();
    expect(
      screen.getByText("How do you prioritize tasks when managing multiple projects?"),
    ).toBeTruthy();
  });

  it("renders score badges on each accordion row", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    expect(screen.getByText("8.88/10")).toBeTruthy();
    expect(screen.getByText("9.37/10")).toBeTruthy();
  });

  it("expands an accordion row when tapped to reveal feedback", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    // Tap Q1 row (the question text is the tappable row)
    fireEvent.press(
      screen.getByText("Tell me about a time when you had to work with a difficult team member."),
    );

    expect(screen.getByText("Good use of the STAR method.")).toBeTruthy();
    expect(
      screen.getByText("I once worked with a colleague who had a very different work style..."),
    ).toBeTruthy();
  });

  it("collapses accordion row when tapped again", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    const q1Text = screen.getByText(
      "Tell me about a time when you had to work with a difficult team member.",
    );

    fireEvent.press(q1Text);
    expect(screen.getByText("Good use of the STAR method.")).toBeTruthy();

    fireEvent.press(q1Text);
    expect(screen.queryByText("Good use of the STAR method.")).toBeNull();
  });

  it("renders Try Again and Go to Dashboard buttons", () => {
    renderWithStore(<MockInterviewResultScreen />, storeWithSession());

    expect(screen.getByText("Try Again")).toBeTruthy();
    expect(screen.getByText("Go to Dashboard")).toBeTruthy();
  });

  it("resets state and navigates to lobby on Try Again", () => {
    const store = storeWithSession();
    renderWithStore(<MockInterviewResultScreen />, store);

    fireEvent.press(screen.getByText("Try Again"));

    expect(mockReplace).toHaveBeenCalledWith("/mock-interview");
    // Redux state should be reset
    const state = store.getState().mockInterview;
    expect(state.sessionId).toBeNull();
    expect(state.finalScore).toBeNull();
  });

  it("resets state and navigates to dashboard on Go to Dashboard", () => {
    const store = storeWithSession();
    renderWithStore(<MockInterviewResultScreen />, store);

    fireEvent.press(screen.getByText("Go to Dashboard"));

    expect(mockReplace).toHaveBeenCalledWith("/");
    const state = store.getState().mockInterview;
    expect(state.sessionId).toBeNull();
  });

  it("shows loading state when results are loading", () => {
    jest.resetModules();
    jest.doMock("@/services/mock-interview-api", () => ({
      useGetInterviewResultsQuery: () => ({
        data: undefined,
        isLoading: true,
        isError: false,
      }),
    }));

    // Just verify no crash
    const store = makeStore();
    renderWithStore(<MockInterviewResultScreen />, store);
  });

  it("shows error state when results fail to load", () => {
    jest.resetModules();
    jest.doMock("@/services/mock-interview-api", () => ({
      useGetInterviewResultsQuery: () => ({
        data: undefined,
        isLoading: false,
        isError: true,
      }),
    }));

    const store = makeStore();
    renderWithStore(<MockInterviewResultScreen />, store);

    expect(screen.getByText(/Failed to load results/i)).toBeTruthy();
  });
});
