import { useCallback, useEffect, useRef, useState } from "react";

import {
  useAnalyzeResumeMutation,
  useLazyGetResumeBuddyHistoryQuery,
} from "../services/resume-buddy-api";
import { subscribeResumeBuddyStatus } from "../services/resume-buddy-sse";
import type {
  ResumeBuddyResponse,
  ResumeBuddyStatusEvent,
  ResumeBuddyBackendStage,
} from "../types";

export type AnalysisPhase = "idle" | "running" | "done" | "error";

interface UseResumeBuddyAnalysis {
  phase: AnalysisPhase;
  activeStage: number;
  result: ResumeBuddyResponse | null;
  error: string | null;
  analyze: (
    domain: string,
    file?: { uri: string; name: string; type?: string; mimeType?: string },
  ) => Promise<void>;
  reset: () => void;
}

// Map a backend stage/status pair to the index of the active UI stage
// (the 6 stages rendered by AnalysisLoadingStep).
function toActiveStage(event: ResumeBuddyStatusEvent): number {
  const map: Record<ResumeBuddyBackendStage, { started: number; completed: number }> = {
    extraction: { started: 0, completed: 1 },
    ats: { started: 1, completed: 3 },
    ai: { started: 3, completed: 4 },
    done: { started: 5, completed: 5 },
  };
  const entry = map[event.stage];
  if (!entry) return 0;
  return event.status === "completed" ? entry.completed : entry.started;
}

export function useResumeBuddyAnalysis(): UseResumeBuddyAnalysis {
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [activeStage, setActiveStage] = useState(0);
  const [result, setResult] = useState<ResumeBuddyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [analyzeResume] = useAnalyzeResumeMutation();
  const [fetchHistory] = useLazyGetResumeBuddyHistoryQuery();

  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupRef.current?.();
    };
  }, []);

  const reset = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setPhase("idle");
    setActiveStage(0);
    setResult(null);
    setError(null);
  }, []);

  // Read the complete, structured record back from /history once the worker has
  // committed it (the SSE "done" event only carries the headline scores).
  const loadFinalResult = useCallback(
    async (jobId: string) => {
      try {
        const history = await fetchHistory().unwrap();
        const match = history.find((h) => h.job_id === jobId);
        if (!isMountedRef.current) return;
        if (match) {
          setResult(match);
          setPhase("done");
        } else {
          setError("Analysis finished but the result could not be loaded.");
          setPhase("error");
        }
      } catch {
        if (!isMountedRef.current) return;
        setError("Analysis finished but the result could not be loaded.");
        setPhase("error");
      }
    },
    [fetchHistory],
  );

  const analyze = useCallback(
    async (
      domain: string,
      file?: { uri: string; name: string; type?: string; mimeType?: string },
    ) => {
      cleanupRef.current?.();
      setPhase("running");
      setActiveStage(0);
      setResult(null);
      setError(null);

      let jobId: string | undefined;
      try {
        const formData = new FormData();
        formData.append("domain", domain);
        if (file) {
          formData.append("file", {
            uri: file.uri,
            type: file.type || file.mimeType || "application/pdf",
            name: file.name,
          } as unknown as Blob);
        }
        const res = await analyzeResume(formData).unwrap();
        jobId = res.job_id;
      } catch {
        if (!isMountedRef.current) return;
        setError("Could not start the analysis. Please check your connection and try again.");
        setPhase("error");
        return;
      }

      if (!jobId) {
        if (!isMountedRef.current) return;
        setError("The server did not return a job to track.");
        setPhase("error");
        return;
      }

      const id = jobId;
      try {
        const close = await subscribeResumeBuddyStatus(id, {
          onEvent: (event) => {
            if (!isMountedRef.current) return;
            setActiveStage((prev) => Math.max(prev, toActiveStage(event)));
            if (event.status === "failed") {
              setError(
                (typeof event.error === "string" && event.error) ||
                  "The analysis failed while processing your resume.",
              );
              setPhase("error");
            } else if (event.stage === "done") {
              void loadFinalResult(id);
            }
          },
          onError: () => {
            if (!isMountedRef.current) return;
            // Stream dropped; the worker may have finished — read the result once.
            void loadFinalResult(id);
          },
        });
        // Component may have unmounted while the subscription was being set up.
        if (!isMountedRef.current) {
          close();
          return;
        }
        cleanupRef.current = close;
      } catch {
        if (!isMountedRef.current) return;
        setError("Failed to establish connection for real-time analysis.");
        setPhase("error");
      }
    },
    [analyzeResume, loadFinalResult],
  );

  return { phase, activeStage, result, error, analyze, reset };
}
