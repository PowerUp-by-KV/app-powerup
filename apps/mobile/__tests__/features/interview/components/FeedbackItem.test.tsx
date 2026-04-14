/**
 * __tests__/features/interview/components/FeedbackItem.test.tsx
 *
 * Tests for the FeedbackItem component.
 */

import React from "react";
import { render } from "@testing-library/react-native";
import { FeedbackItem } from "../../../../src/features/interview/components/feedback/FeedbackItem";

describe("FeedbackItem Component", () => {
  it("renders good feedback", () => {
    const { getByText } = render(
      <FeedbackItem type="good" text="Great answer with specific examples" />,
    );

    expect(getByText("Great answer with specific examples")).toBeTruthy();
    expect(getByText("✅")).toBeTruthy();
  });

  it("renders warning feedback", () => {
    const { getByText } = render(
      <FeedbackItem type="warning" text="Try to quantify your achievements" />,
    );

    expect(getByText("Try to quantify your achievements")).toBeTruthy();
    expect(getByText("⚠️")).toBeTruthy();
  });

  it("renders tip feedback", () => {
    const { getByText } = render(
      <FeedbackItem type="tip" text="Use the STAR method for structured answers" />,
    );

    expect(getByText("Use the STAR method for structured answers")).toBeTruthy();
    expect(getByText("💡")).toBeTruthy();
  });

  it("handles long feedback text", () => {
    const { getByText } = render(
      <FeedbackItem
        type="good"
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      />,
    );

    expect(getByText(/Lorem ipsum/)).toBeTruthy();
  });
});
