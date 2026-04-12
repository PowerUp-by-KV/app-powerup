/**
 * __tests__/features/interview/components/LiveIndicator.test.tsx
 *
 * Tests for the LiveIndicator component.
 */

import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { LiveIndicator } from "../../../../src/features/interview/components/live/LiveIndicator";

describe("LiveIndicator Component", () => {
  it("renders with correct label and value", () => {
    const { getByText } = render(
      <LiveIndicator label="Speaking Pace" value={120} color="#007AFF" unit=" WPM" />,
    );

    expect(getByText("Speaking Pace")).toBeTruthy();
    expect(getByText("120 WPM")).toBeTruthy();
  });

  it("renders label without unit when not provided", () => {
    const { getByText } = render(
      <LiveIndicator label="Clarity" value={75} color="#51CF66" unit="%" />,
    );

    expect(getByText("Clarity")).toBeTruthy();
    expect(getByText("75%")).toBeTruthy();
  });

  it("handles zero value correctly", () => {
    const { getByText } = render(<LiveIndicator label="Test" value={0} color="#666" unit="%" />);

    expect(getByText("0%")).toBeTruthy();
  });

  it("handles max value correctly", () => {
    const { getByText } = render(<LiveIndicator label="Test" value={100} color="#666" />);

    expect(getByText("100")).toBeTruthy();
  });

  it("animates when value changes", async () => {
    const { rerender, getByText } = render(<LiveIndicator label="Test" value={25} color="#666" />);

    expect(getByText("25")).toBeTruthy();

    rerender(<LiveIndicator label="Test" value={75} color="#666" />);

    await waitFor(() => {
      expect(getByText("75")).toBeTruthy();
    });
  });

  it("renders without unit when not provided", () => {
    const { getByText } = render(<LiveIndicator label="Filler Words" value={5} color="#FFA500" />);

    expect(getByText("5")).toBeTruthy();
  });

  it("respects custom maxValue prop", () => {
    const { getByText } = render(
      <LiveIndicator label="WPM" value={150} color="#007AFF" maxValue={250} />,
    );

    expect(getByText("150")).toBeTruthy();
  });

  it("handles high values with maxValue scaling", () => {
    const { getByText } = render(
      <LiveIndicator label="Speed" value={200} color="#007AFF" maxValue={300} />,
    );

    expect(getByText("200")).toBeTruthy();
  });
});
