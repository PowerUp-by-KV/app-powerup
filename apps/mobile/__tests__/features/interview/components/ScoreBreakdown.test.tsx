/**
 * __tests__/features/interview/components/ScoreBreakdown.test.tsx
 *
 * Tests for the ScoreBreakdown component.
 */

import React from "react";
import { render } from "@testing-library/react-native";
import { ScoreBreakdown } from "../../../../src/features/interview/components/feedback/ScoreBreakdown";
import type { ScoreBreakdownItem } from "../../../../src/features/interview/types/interview.types";

describe("ScoreBreakdown Component", () => {
  const mockItems: ScoreBreakdownItem[] = [
    { label: "Relevance", score: 85, weight: 0.25 },
    { label: "Structure", score: 70, weight: 0.25 },
    { label: "Clarity", score: 80, weight: 0.25 },
    { label: "Depth", score: 75, weight: 0.25 },
  ];

  it("renders all score items", () => {
    const { getByText } = render(<ScoreBreakdown items={mockItems} />);

    expect(getByText("Relevance")).toBeTruthy();
    expect(getByText("Structure")).toBeTruthy();
    expect(getByText("Clarity")).toBeTruthy();
    expect(getByText("Depth")).toBeTruthy();
  });

  it("displays correct scores", () => {
    const { getByText } = render(<ScoreBreakdown items={mockItems} />);

    expect(getByText("85%")).toBeTruthy();
    expect(getByText("70%")).toBeTruthy();
    expect(getByText("80%")).toBeTruthy();
    expect(getByText("75%")).toBeTruthy();
  });

  it("renders custom title", () => {
    const { getByText } = render(<ScoreBreakdown items={mockItems} title="Custom Title" />);

    expect(getByText("Custom Title")).toBeTruthy();
  });

  it("renders default title when not provided", () => {
    const { getByText } = render(<ScoreBreakdown items={mockItems} />);

    expect(getByText("Score Breakdown")).toBeTruthy();
  });

  it("handles empty items array", () => {
    const { getByText } = render(<ScoreBreakdown items={[]} />);

    expect(getByText("Score Breakdown")).toBeTruthy();
  });

  it("handles single item", () => {
    const singleItem: ScoreBreakdownItem[] = [{ label: "Overall", score: 85, weight: 1 }];

    const { getByText } = render(<ScoreBreakdown items={singleItem} />);

    expect(getByText("Overall")).toBeTruthy();
    expect(getByText("85%")).toBeTruthy();
  });

  it("handles high and low scores", () => {
    const extremeItems: ScoreBreakdownItem[] = [
      { label: "Best", score: 100, weight: 0.5 },
      { label: "Worst", score: 0, weight: 0.5 },
    ];

    const { getByText } = render(<ScoreBreakdown items={extremeItems} />);

    expect(getByText("100%")).toBeTruthy();
    expect(getByText("0%")).toBeTruthy();
  });
});
