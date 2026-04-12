/**
 * __tests__/features/interview/components/QuestionReviewItem.test.tsx
 *
 * Tests for the QuestionReviewItem component.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QuestionReviewItem } from "../../../../src/features/interview/components/report/QuestionReviewItem";
import type { QuestionReviewItem as QuestionReviewItemType } from "../../../../src/features/interview/types/interview.types";

describe("QuestionReviewItem Component", () => {
  const mockQuestion: QuestionReviewItemType = {
    questionId: "q1",
    text: "Tell me about a time you handled a difficult situation",
    score: 85,
    duration: 120,
    feedback: "Good answer with specific examples and clear results.",
  };

  it("renders question text", () => {
    const { getByText } = render(<QuestionReviewItem {...mockQuestion} />);

    expect(getByText("Tell me about a time you handled a difficult situation")).toBeTruthy();
  });

  it("displays score", () => {
    const { getByText } = render(<QuestionReviewItem {...mockQuestion} />);

    expect(getByText("85")).toBeTruthy();
  });

  it("displays duration in MM:SS format", () => {
    const { getByText } = render(<QuestionReviewItem {...mockQuestion} />);

    // 120 seconds = 2 minutes
    expect(getByText("2:00")).toBeTruthy();
  });

  it("expands to show feedback on tap", () => {
    const { getByText, queryByText } = render(<QuestionReviewItem {...mockQuestion} />);

    // Feedback should not be visible initially
    expect(queryByText("Good answer with specific examples and clear results.")).toBeFalsy();

    // Tap to expand
    const header = getByText("Tell me about a time you handled a difficult situation");
    fireEvent.press(header);

    // Now feedback should be visible
    expect(getByText("Good answer with specific examples and clear results.")).toBeTruthy();
  });

  it("collapses when tapped again", () => {
    const { getByText, queryByText } = render(<QuestionReviewItem {...mockQuestion} />);

    const header = getByText("Tell me about a time you handled a difficult situation");

    // Expand
    fireEvent.press(header);
    expect(getByText("Good answer with specific examples and clear results.")).toBeTruthy();

    // Collapse
    fireEvent.press(header);
    expect(queryByText("Good answer with specific examples and clear results.")).toBeFalsy();
  });

  it("shows 'Feedback' label when expanded", () => {
    const { getByText, queryByText } = render(<QuestionReviewItem {...mockQuestion} />);

    // Initially not shown
    expect(queryByText("Feedback")).toBeFalsy();

    // Expand
    const header = getByText("Tell me about a time you handled a difficult situation");
    fireEvent.press(header);

    // Now shown
    expect(getByText("Feedback")).toBeTruthy();
  });

  it("handles high scores with green color", () => {
    const highScoreQuestion: QuestionReviewItemType = {
      ...mockQuestion,
      score: 95,
    };

    const { getByText } = render(<QuestionReviewItem {...highScoreQuestion} />);

    expect(getByText("95")).toBeTruthy();
  });

  it("handles low scores with red color", () => {
    const lowScoreQuestion: QuestionReviewItemType = {
      ...mockQuestion,
      score: 45,
    };

    const { getByText } = render(<QuestionReviewItem {...lowScoreQuestion} />);

    expect(getByText("45")).toBeTruthy();
  });

  it("handles zero duration", () => {
    const zeroDurationQuestion: QuestionReviewItemType = {
      ...mockQuestion,
      duration: 0,
    };

    const { getByText } = render(<QuestionReviewItem {...zeroDurationQuestion} />);

    expect(getByText("0:00")).toBeTruthy();
  });

  it("handles long duration", () => {
    const longDurationQuestion: QuestionReviewItemType = {
      ...mockQuestion,
      duration: 3661, // 1 hour, 1 minute, 1 second
    };

    const { getByText } = render(<QuestionReviewItem {...longDurationQuestion} />);

    // Should format as MM:SS within the minute
    expect(getByText("61:01")).toBeTruthy();
  });

  it("handles very long question text", () => {
    const longTextQuestion: QuestionReviewItemType = {
      ...mockQuestion,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    };

    const { getByText } = render(<QuestionReviewItem {...longTextQuestion} />);

    expect(getByText(/Lorem ipsum/)).toBeTruthy();
  });
});
