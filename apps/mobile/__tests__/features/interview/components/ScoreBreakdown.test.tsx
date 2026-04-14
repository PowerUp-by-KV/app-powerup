/**
 * __tests__/features/interview/components/ScoreBreakdown.test.tsx
 *
 * Tests for the ScoreBreakdown component.
 */

import React from "react";
import { render } from "@testing-library/react-native";
import { ScoreBreakdown } from "../../../../src/features/interview/components/feedback/ScoreBreakdown";
import type { BreakdownData } from "../../../../src/features/interview/components/feedback/ScoreBreakdown";

describe("ScoreBreakdown Component", () => {
  const mockBreakdown: BreakdownData = {
    relevance: 85,
    structure: 70,
    clarity: 80,
    depth: 75,
  };

  it("renders all score labels", () => {
    const { getByText } = render(<ScoreBreakdown breakdown={mockBreakdown} />);

    expect(getByText("Relevance")).toBeTruthy();
    expect(getByText("Structure")).toBeTruthy();
    expect(getByText("Clarity")).toBeTruthy();
    expect(getByText("Depth")).toBeTruthy();
  });

  it("displays correct scores as percentages", () => {
    const { getByText } = render(<ScoreBreakdown breakdown={mockBreakdown} />);

    expect(getByText("85%")).toBeTruthy();
    expect(getByText("70%")).toBeTruthy();
    expect(getByText("80%")).toBeTruthy();
    expect(getByText("75%")).toBeTruthy();
  });

  it("renders with zeroes", () => {
    const zeroBreakdown = {
      relevance: 0,
      structure: 0,
      clarity: 0,
      depth: 0,
    };
    const { getAllByText } = render(<ScoreBreakdown breakdown={zeroBreakdown} />);

    // 4 categories with 0%
    expect(getAllByText("0%").length).toBe(4);
  });
});
