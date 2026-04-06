import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { incrementTime } from "@/store/slices/timeTrackingSlice";

export const useTimeTracker = (moduleId: string) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!moduleId) return;

    const interval = setInterval(() => {
      dispatch(incrementTime({ moduleId, seconds: 5 }));
    }, 5000);

    return () => clearInterval(interval);
  }, [moduleId, dispatch]);
};
