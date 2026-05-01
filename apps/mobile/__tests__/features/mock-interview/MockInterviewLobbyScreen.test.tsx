import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MockInterviewLobbyScreen } from "@/features/mock-interview";
import mockInterviewReducer from "@/store/slices/mock-interview.slice";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

const mockStartInterview = jest.fn();
const mockGetPastAttempts = jest.fn();

jest.mock("@/services/mock-interview-api", () => ({
  useStartInterviewMutation: () => [mockStartInterview, { isLoading: false }],
  useGetPastAttemptsQuery: () => mockGetPastAttempts(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStore() {
  return configureStore({
    reducer: { mockInterview: mockInterviewReducer },
  });
}

function renderWithStore(ui: React.ReactElement) {
  const store = makeStore();
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MockInterviewLobbyScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the header and subtitle", () => {
    mockGetPastAttempts.mockReturnValue({
      data: { attempts: [] },
      isLoading: false,
      isError: false,
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    expect(screen.getByText("Mock Interview")).toBeTruthy();
    expect(screen.getByText("Practice real interview questions")).toBeTruthy();
  });

  it("renders the Start New Interview button", () => {
    mockGetPastAttempts.mockReturnValue({
      data: { attempts: [] },
      isLoading: false,
      isError: false,
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    expect(screen.getByText("Start New Interview")).toBeTruthy();
  });

  it("shows empty state message when there are no past attempts", () => {
    mockGetPastAttempts.mockReturnValue({
      data: { attempts: [] },
      isLoading: false,
      isError: false,
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    expect(screen.getByText(/No past attempts yet/i)).toBeTruthy();
  });

  it("renders past attempts list when data is available", () => {
    mockGetPastAttempts.mockReturnValue({
      data: {
        attempts: [
          {
            id: "session-1",
            status: "completed",
            score: 8.2,
            total_questions: 8,
            created_at: "2026-04-28T10:00:00Z",
          },
          {
            id: "session-2",
            status: "in_progress",
            score: null,
            total_questions: 8,
            created_at: "2026-04-23T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    expect(screen.getByText("Past Attempts")).toBeTruthy();
    expect(screen.getByText("Score: 8.2/10")).toBeTruthy();
    expect(screen.getByText("In Progress")).toBeTruthy();
  });

  it("shows loading indicator while fetching attempts", () => {
    mockGetPastAttempts.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    // ActivityIndicator renders — no crash
    expect(screen.queryByText("Past Attempts")).toBeNull();
  });

  it("treats API error as empty state — shows no-attempts message", () => {
    mockGetPastAttempts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    expect(screen.getByText(/No past attempts yet/i)).toBeTruthy();
  });

  it("calls startInterview and navigates to question on button press", async () => {
    mockGetPastAttempts.mockReturnValue({
      data: { attempts: [] },
      isLoading: false,
      isError: false,
    });

    mockStartInterview.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        id: "new-session-id",
        total_questions: 8,
        status: "in_progress",
      }),
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    fireEvent.press(screen.getByText("Start New Interview"));

    await waitFor(() => {
      expect(mockStartInterview).toHaveBeenCalledWith({
        cefr_level: "B1-B2",
        domain: "IT",
        total_questions: 8,
      });
      expect(mockPush).toHaveBeenCalledWith("/mock-interview/question");
    });
  });

  it("navigates to question screen when tapping an in-progress attempt", () => {
    mockGetPastAttempts.mockReturnValue({
      data: {
        attempts: [
          {
            id: "session-ip",
            status: "in_progress",
            score: null,
            total_questions: 8,
            created_at: "2026-04-23T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    fireEvent.press(screen.getByText("In Progress"));

    expect(mockPush).toHaveBeenCalledWith("/mock-interview/question");
  });

  it("navigates to result screen when tapping a completed attempt", () => {
    mockGetPastAttempts.mockReturnValue({
      data: {
        attempts: [
          {
            id: "session-done",
            status: "completed",
            score: 6.5,
            total_questions: 8,
            created_at: "2026-04-25T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    renderWithStore(<MockInterviewLobbyScreen />);

    fireEvent.press(screen.getByText("Score: 6.5/10"));

    expect(mockPush).toHaveBeenCalledWith("/mock-interview/result");
  });
});
