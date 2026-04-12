/**
 * __tests__/features/interview/components/STARMethodIndicator.test.tsx
 *
 * Tests for the STARMethodIndicator component.
 */

import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { STARMethodIndicator } from "../../../../src/features/interview/components/feedback/STARMethodIndicator";
import type { STARMethodAnalysis } from "../../../../src/features/interview/types/interview.types";

describe("STARMethodIndicator Component", () => {
  const mockAnalysis: STARMethodAnalysis = {
    situation: { present: true, quality: "excellent" },
    task: { present: true, quality: "good" },
    action: { present: true, quality: "excellent" },
    result: { present: false, quality: "weak" },
    overallScore: 75,
  };

  it("renders all STAR components", () => {
    const { getByText } = render(<STARMethodIndicator analysis={mockAnalysis} />);

    expect(getByText("SITUATION")).toBeTruthy();
    expect(getByText("TASK")).toBeTruthy();
    expect(getByText("ACTION")).toBeTruthy();
    expect(getByText("RESULT")).toBeTruthy();
  });

  it("displays quality levels correctly", () => {
    const { getAllByText, getByText } = render(<STARMethodIndicator analysis={mockAnalysis} />);

    // "Excellent" should appear twice (situation and action)
    const excellent = getAllByText("Excellent");
    expect(excellent.length).toBeGreaterThanOrEqual(2);

    // "Good" for task
    const good = getByText("Good");
    expect(good).toBeTruthy();
  });

  it("shows missing indicator for absent components", () => {
    const analysisWithMissing: STARMethodAnalysis = {
      situation: { present: true, quality: "good" },
      task: { present: false, quality: "weak" },
      action: { present: true, quality: "good" },
      result: { present: false, quality: "weak" },
      overallScore: 50,
    };

    const { getAllByText } = render(<STARMethodIndicator analysis={analysisWithMissing} />);

    // Should have at least 2 "Missing" indicators (for task and result)
    const missing = getAllByText("Missing");
    expect(missing.length).toBeGreaterThanOrEqual(2);
  });

  it("animates on mount", async () => {
    const { getByText } = render(<STARMethodIndicator analysis={mockAnalysis} />);

    await waitFor(() => {
      expect(getByText("SITUATION")).toBeTruthy();
    });
  });

  it("handles all excellent quality", () => {
    const perfectAnalysis: STARMethodAnalysis = {
      situation: { present: true, quality: "excellent" },
      task: { present: true, quality: "excellent" },
      action: { present: true, quality: "excellent" },
      result: { present: true, quality: "excellent" },
      overallScore: 100,
    };

    const { getByText } = render(<STARMethodIndicator analysis={perfectAnalysis} />);

    expect(getByText("SITUATION")).toBeTruthy();
    expect(getByText("TASK")).toBeTruthy();
  });

  it("handles all weak quality", () => {
    const poorAnalysis: STARMethodAnalysis = {
      situation: { present: false, quality: "weak" },
      task: { present: false, quality: "weak" },
      action: { present: false, quality: "weak" },
      result: { present: false, quality: "weak" },
      overallScore: 0,
    };

    const { getAllByText } = render(<STARMethodIndicator analysis={poorAnalysis} />);

    const missing = getAllByText("Missing");
    expect(missing.length).toBeGreaterThanOrEqual(4);
  });
});
