import React from "react";
import { BadgesScreen } from "../../src/features/progress/Badges";
import { ProgressProvider } from "@/features/progress/hooks/ProgressContext";

export default function BadgesRoute() {
  return (
    <ProgressProvider>
      <BadgesScreen />
    </ProgressProvider>
  );
}
