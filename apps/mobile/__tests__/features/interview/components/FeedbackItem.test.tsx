/**
 * __tests__/features/interview/components/FeedbackItem.test.tsx
 *
 * Tests for the FeedbackItem component.
 */

import React from "react";
import { render } from "@testing-library/react-native";
import { FeedbackItem } from "../../../../src/features/interview/components/feedback/FeedbackItem";
import type { FeedbackItem as FeedbackItemType } from "../../../../src/features/interview/types/interview.types";

describe("FeedbackItem Component", () => {
  const mockFeedback: FeedbackItemType = {
    id: "1",
    type: "strength",
    icon: "check-circle",
    text: "Great answer with specific examples",
    color: "#51CF66",
  };

  const improvementFeedback: FeedbackItemType = {
    id: "2",
    type: "improvement",
    icon: "alert-circle",
    text: "Try to quantify your achievements",
    color: "#FF6B6B",
  };

  const tipFeedback: FeedbackItemType = {
    id: "3",
    type: "tip",
    icon: "lightbulb-on",
    text: "Use the STAR method for structured answers",
    color: "#FFA500",
  };

  it("renders feedback text", () => {
    const { getByText } = render(<FeedbackItem {...mockFeedback} />);

    expect(getByText("Great answer with specific examples")).toBeTruthy();
  });

  it("displays correct feedback type", () => {
    const { getByText } = render(<FeedbackItem {...mockFeedback} />);

    expect(getByText("Strength")).toBeTruthy();
  });

  it("capitalizes improvement type", () => {
    const { getByText } = render(<FeedbackItem {...improvementFeedback} />);

    expect(getByText("Improvement")).toBeTruthy();
  });

  it("capitalizes tip type", () => {
    const { getByText } = render(<FeedbackItem {...tipFeedback} />);

    expect(getByText("Tip")).toBeTruthy();
  });

  it("handles animation delay prop", () => {
    const { getByText } = render(<FeedbackItem {...mockFeedback} delay={200} />);

    expect(getByText("Great answer with specific examples")).toBeTruthy();
  });

  it("renders with all feedback types", () => {
    const { getByText } = render(
      <>
        <FeedbackItem {...mockFeedback} />
        <FeedbackItem {...improvementFeedback} />
        <FeedbackItem {...tipFeedback} />
      </>,
    );

    expect(getByText("Strength")).toBeTruthy();
    expect(getByText("Improvement")).toBeTruthy();
    expect(getByText("Tip")).toBeTruthy();
  });

  it("handles missing icon gracefully", () => {
    const feedbackWithoutIcon: FeedbackItemType = {
      ...mockFeedback,
      icon: "",
    };

    const { getByText } = render(<FeedbackItem {...feedbackWithoutIcon} />);

    expect(getByText("Strength")).toBeTruthy();
  });

  it("handles long feedback text", () => {
    const longFeedback: FeedbackItemType = {
      ...mockFeedback,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    };

    const { getByText } = render(<FeedbackItem {...longFeedback} />);

    expect(getByText(/Lorem ipsum/)).toBeTruthy();
  });

  it("supports different colors", () => {
    const coloredFeedback: FeedbackItemType = {
      ...mockFeedback,
      color: "#007AFF",
    };

    const { getByText } = render(<FeedbackItem {...coloredFeedback} />);

    expect(getByText("Great answer with specific examples")).toBeTruthy();
  });
});
