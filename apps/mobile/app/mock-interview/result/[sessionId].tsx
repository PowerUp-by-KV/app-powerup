/**
 * app/mock-interview/result/[sessionId].tsx — Mock interview result route
 * Matches: /mock-interview/result/:sessionId
 *
 * Thin wrapper for MockInterviewResultScreen.
 *
 * Path param:
 *   sessionId — the id of the completed session (used to fetch results).
 */
import React, { useRef } from "react";
import { useLocalSearchParams } from "expo-router";

import { MockInterviewResultScreen } from "@/features/mock-interview";
import { createNavigationBridge } from "@/utils/navigationBridge";

export default function MockInterviewResultRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const navigation = useRef(createNavigationBridge()).current;

  // Build session object from sessionId and passed params
  const session = {
    id: sessionId || "",
    title: "Mock Interview",
  };

  return (
    <MockInterviewResultScreen
      navigation={navigation as never}
      route={
        {
          key: "MockInterviewResult",
          name: "MockInterviewResult",
          params: { session },
        } as never
      }
    />
  );
}
