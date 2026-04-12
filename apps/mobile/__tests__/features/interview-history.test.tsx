import React from "react";
import { render, screen } from "@testing-library/react-native";
import { InterviewHistoryScreen } from "@/features/interview-history";

// Mock the RTK Query hook
jest.mock("@/features/interview-history/hooks/useInterviewHistory", () => ({
  useGetInterviewHistoryQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
}));

describe("InterviewHistoryScreen", () => {
  it("renders the empty state correctly when there are no sessions", () => {
    render(<InterviewHistoryScreen />);

    expect(screen.getByText("History")).toBeTruthy();
    expect(screen.getByText("Review your past mock interviews")).toBeTruthy();
    expect(screen.getByText("No Sessions Yet")).toBeTruthy();
  });
});
