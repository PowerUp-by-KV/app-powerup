/**
 * __tests__/features/interview/components/STARMethodIndicator.test.tsx
 *
 * Tests for the STARMethodIndicator component.
 */

import React from "react";
import { render } from "@testing-library/react-native";
import { STARMethodIndicator } from "../../../../src/features/interview/components/feedback/STARMethodIndicator";

describe("STARMethodIndicator Component", () => {
  const mockStar = {
    situation: true,
    task: true,
    action: true,
    result: false,
  };

  it("renders all STAR components", () => {
    const { getByText } = render(<STARMethodIndicator star={mockStar} />);

    expect(getByText("S")).toBeTruthy();
    expect(getByText("T")).toBeTruthy();
    expect(getByText("A")).toBeTruthy();
    expect(getByText("R")).toBeTruthy();
  });

  it("displays present/missing emojis correctly", () => {
    const { getAllByText } = render(<STARMethodIndicator star={mockStar} />);

    // 3 present (✅), 1 missing (⚠️)
    expect(getAllByText("✅").length).toBe(3);
    expect(getAllByText("⚠️").length).toBe(1);
  });

  it("shows missing indicator for absent components", () => {
    const starWithMissing = {
      situation: true,
      task: false,
      action: true,
      result: false,
    };

    const { getAllByText } = render(<STARMethodIndicator star={starWithMissing} />);

    const missing = getAllByText("⚠️");
    expect(missing.length).toBe(2);
  });

  it("handles all excellent quality", () => {
    const perfectStar = {
      situation: true,
      task: true,
      action: true,
      result: true,
    };

    const { getAllByText } = render(<STARMethodIndicator star={perfectStar} />);

    expect(getAllByText("✅").length).toBe(4);
  });

  it("handles all weak quality", () => {
    const poorStar = {
      situation: false,
      task: false,
      action: false,
      result: false,
    };

    const { getAllByText } = render(<STARMethodIndicator star={poorStar} />);

    expect(getAllByText("⚠️").length).toBe(4);
  });
});
