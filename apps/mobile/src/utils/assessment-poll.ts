export interface AssessmentStatusResponse {
  pending_answers: number;
  failed_answers: number;
  completed_answers?: number;
  total_answers?: number;
}

/**
 * Reusable utility to poll assessment scoring status until pending_answers reaches 0
 * or error / failed answers occur.
 */
export async function pollAssessmentScoringStatus(
  sessionId: string,
  getAssessmentStatus: (arg: { session_id: string }) => {
    unwrap: () => Promise<AssessmentStatusResponse>;
  },
  maxRetries = 10,
): Promise<void> {
  let checkRetries = maxRetries;
  while (checkRetries > 0) {
    try {
      const status = await getAssessmentStatus({ session_id: sessionId }).unwrap();
      if (status.pending_answers > 0) {
        checkRetries--;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else if (status.failed_answers > 0) {
        console.warn("Some answers failed to score in backend processing:", status);
        break;
      } else {
        break;
      }
    } catch (pollErr) {
      console.warn("Polling assessment status failed, continuing anyway:", pollErr);
      break;
    }
  }
}
