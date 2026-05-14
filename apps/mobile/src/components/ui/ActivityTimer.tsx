import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { Timer as TimerIcon } from "lucide-react-native";

interface ActivityTimerProps {
  duration: number; // seconds
  onTimeUp?: () => void;
  paused?: boolean;
  className?: string;
}

export const ActivityTimer: React.FC<ActivityTimerProps> = ({
  duration,
  onTimeUp,
  paused = false,
  className = "",
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      onTimeUp?.();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, paused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeft < 60;

  return (
    <View
      className={`flex-row items-center bg-white/90 px-5 py-2.5 rounded-full shadow-lg border ${isLowTime ? "border-red-400 bg-red-50" : "border-slate-200"} ${className}`}
    >
      <TimerIcon size={18} color={isLowTime ? "#ef4444" : "#475569"} />
      <Text
        className={`ml-2 font-black text-lg tracking-tighter ${isLowTime ? "text-red-600 animate-pulse" : "text-slate-800"}`}
      >
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
};
