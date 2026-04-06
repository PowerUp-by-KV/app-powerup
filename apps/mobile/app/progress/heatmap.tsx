import React from "react";
import { StrengthWeaknessHeatmap } from "../../src/features/progress/StrengthWeaknessHeatmap";
import { ProgressProvider } from "@/features/progress/hooks/ProgressContext";

export default function HeatmapRoute() {
  return (
    <ProgressProvider>
      <StrengthWeaknessHeatmap />
    </ProgressProvider>
  );
}
