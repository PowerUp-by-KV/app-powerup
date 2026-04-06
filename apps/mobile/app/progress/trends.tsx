import React from "react";
import { ProgressTrends } from "../../src/features/progress/ProgressTrends";
import { ProgressProvider } from "@/features/progress/hooks/ProgressContext";

export default function TrendsRoute() {
  return (
    <ProgressProvider>
      <ProgressTrends />
    </ProgressProvider>
  );
}
