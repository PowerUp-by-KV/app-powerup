/**
 * __tests__/features/interview/components/LiveIndicator.test.tsx
 *
 * Tests for the LiveIndicator component.
 */

import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { LiveIndicator } from "../../../../src/features/interview/components/live/LiveIndicator";

describe("LiveIndicator Component", () => {
  it("renders with correct label and status", () => {
    const { getByText } = render(<LiveIndicator label="Speaking Pace" value={80} status="Good" />);

    expect(getByText("Speaking Pace")).toBeTruthy();
    expect(getByText("Good")).toBeTruthy();
  });

  it("handles zero value correctly", () => {
    const { getByText } = render(<LiveIndicator label="Test" value={0} status="Low" />);

    expect(getByText("Test")).toBeTruthy();
    expect(getByText("Low")).toBeTruthy();
  });

  it("handles max value correctly", () => {
    const { getByText } = render(<LiveIndicator label="Test" value={150} status="Good" />);

    expect(getByText("Good")).toBeTruthy();
  });

  it("animates when value changes", async () => {
    const { rerender, getByText } = render(<LiveIndicator label="Test" value={25} status="Low" />);

    expect(getByText("Low")).toBeTruthy();

    rerender(<LiveIndicator label="Test" value={75} status="Good" />);

    await waitFor(() => {
      expect(getByText("Good")).toBeTruthy();
    });
  });
});
