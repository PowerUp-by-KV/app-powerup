import { useState, useCallback, useMemo } from "react";
import { ActivityBase } from "@/services/types";
import { useDispatch, useSelector } from "react-redux";
import { completeActivity } from "@/store/slices/progressSlice";
import { RootState } from "@/store";

export type ActivityType =
  | "overview"
  | "listening"
  | "reading"
  | "vocabulary"
  | "speaking"
  | "grammar"
  | "writing"
  | "complete";

export const useActivityProgress = (
  activities: ActivityBase[] = [],
  moduleId: string,
  dayNo: number,
) => {
  const dispatch = useDispatch();
  const dayKey = `${moduleId}_${dayNo}`;

  // Get completed activity IDs from Redux
  const persistedCompletedIds = useSelector(
    (state: RootState) => state.progress.completedActivities[dayKey] || [],
  );

  const [currentIndex, setCurrentIndex] = useState(-1); // -1 is overview
  const [scores, setScores] = useState<Record<string, number>>({});

  // Map persisted IDs back to indices
  const completedIndices = useMemo(() => {
    return activities
      .map((a, i) => (persistedCompletedIds.includes(a.id) ? i : -1))
      .filter((i) => i !== -1);
  }, [activities, persistedCompletedIds]);

  const currentActivity: ActivityType = useMemo(() => {
    if (currentIndex === -1) return "overview";
    if (currentIndex >= activities.length) return "complete";
    return activities[currentIndex]?.type as ActivityType;
  }, [currentIndex, activities]);

  const recordScore = useCallback(
    (type: string, score: number) => {
      setScores((prev) => ({ ...prev, [type]: score }));

      if (currentIndex !== -1) {
        const activityId = activities[currentIndex]?.id;
        // Persist to Redux immediately
        if (activityId) {
          dispatch(completeActivity({ moduleId, dayNo, activityId }));
        }
      }
    },
    [currentIndex, activities, moduleId, dayNo, dispatch],
  );

  const nextActivity = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const jumpToIndex = useCallback(
    (index: number) => {
      // Logic: index 0 is always unlocked. Others are unlocked if previous is completed.
      // Also, if it's already completed, it's always clickable (for repetition).
      const isCompleted = completedIndices.includes(index);
      const isPreviousCompleted = index === 0 || completedIndices.includes(index - 1);

      if (isCompleted || isPreviousCompleted) {
        setCurrentIndex(index);
      }
    },
    [completedIndices],
  );

  const resetProgress = useCallback(() => {
    setCurrentIndex(-1);
    // Note: We don't reset Redux here as per user request ("when user wants to do again they can do")
    // But we might want a way to clear it if they specifically restart the day.
  }, []);

  const averageScore = useMemo(() => {
    const values = Object.values(scores);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [scores]);

  const allCompleted = useMemo(() => {
    return activities.length > 0 && completedIndices.length === activities.length;
  }, [activities, completedIndices]);

  const totalPoints = useMemo(() => {
    return Object.values(scores).filter((s) => s === 100).length * 20;
  }, [scores]);

  return {
    currentIndex,
    currentActivity,
    scores,
    completedIndices,
    recordScore,
    nextActivity,
    jumpToIndex,
    resetProgress,
    allCompleted,
    averageScore,
    totalPoints,
  };
};
