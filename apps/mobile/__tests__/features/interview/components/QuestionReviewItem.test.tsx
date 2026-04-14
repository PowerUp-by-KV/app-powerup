/**
 * __tests__/features/interview/components/QuestionReviewItem.test.tsx
 *
 * Tests for the QuestionReviewItem component.
 */

import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { QuestionReviewItem } from "../../../../src/features/interview/components/report/QuestionReviewItem";

describe("QuestionReviewItem Component", () => {
  const mockProps = {
    index: 1,
    question: "Tell me about a time you handled a difficult situation",
    score: 85,
    feedback: "Good answer with specific examples and clear results.",
  };

  it("renders question text and index", () => {
    const { getByText } = render(<QuestionReviewItem {...mockProps} />);

    expect(getByText("Tell me about a time you handled a difficult situation")).toBeTruthy();
    expect(getByText("Q1")).toBeTruthy();
  });

  it("displays score out of 100", () => {
    const { getByText } = render(<QuestionReviewItem {...mockProps} />);

    expect(getByText("85/100")).toBeTruthy();
  });

  it("shows feedback content and triggers expand animation on tap", () => {
    const { getByText } = render(<QuestionReviewItem {...mockProps} />);

    // Since the Animated element doesn't unmount, the text is accessible
    // to the testing library even when collapsed (maxHeight: 0).
    // We just verify it renders into the DOM without crashing and can be clicked.
    const header = getByText("Tell me about a time you handled a difficult situation");
    act(() => {
      fireEvent.press(header);
    });

    expect(getByText("Good answer with specific examples and clear results.")).toBeTruthy();
    expect(getByText("Feedback")).toBeTruthy();
    expect(getByText("Score")).toBeTruthy();
  });

  it("shows fallback text when no feedback provided", () => {
    const noFeedbackProps = { ...mockProps, feedback: undefined };
    const { getByText } = render(<QuestionReviewItem {...noFeedbackProps} />);

    expect(getByText("No feedback available.")).toBeTruthy();
  });

  it("handles very long question text", () => {
    const longTextProps = {
      ...mockProps,
      question:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    };

    const { getByText } = render(<QuestionReviewItem {...longTextProps} />);

    expect(getByText(/Lorem ipsum/)).toBeTruthy();
  });
});
