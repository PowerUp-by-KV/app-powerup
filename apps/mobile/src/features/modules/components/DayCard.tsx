import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckCircle2, PlayCircle, Lock, ChevronRight } from "lucide-react-native";

interface DayCardProps {
  dayNo: number;
  title?: string;
  status: "completed" | "current" | "locked";
  score?: number;
  label?: "Module" | "Day";
  onPress: () => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  dayNo,
  title,
  status,
  score,
  label = "Day",
  onPress,
}) => {
  const isLocked = status === "locked";
  const isCurrent = status === "current";
  const isCompleted = status === "completed";

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle2 size={24} color="#10b981" />;
    if (isCurrent) return <PlayCircle size={24} color="#475569" />;
    return <Lock size={20} color="#94A3B8" />;
  };

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.7}
      onPress={isLocked ? undefined : onPress}
      className={`flex-row items-center p-4 mb-3 rounded-[20px] bg-white border ${
        isCurrent ? "border-[#475569] shadow-md" : "border-slate-100 shadow-sm"
      } ${isLocked ? "bg-slate-50/50" : ""}`}
    >
      <View className="mr-4">{getStatusIcon()}</View>

      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-0.5">
          <View className="flex-1 mr-2">
            <Text
              className={`text-[12px] font-bold uppercase tracking-wider ${isLocked ? "text-slate-300" : "text-slate-500"}`}
            >
              {label} {dayNo}
            </Text>
            <Text
              className={`text-[17px] font-bold mt-0.5 ${isLocked ? "text-slate-400" : "text-[#1E293B]"}`}
            >
              {title || `Module ${dayNo}`}
            </Text>
          </View>
          {isCompleted && score !== undefined && (
            <View className="bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
              <Text className="text-emerald-700 text-[12px] font-bold">{score}%</Text>
            </View>
          )}
        </View>
      </View>

      <View className="ml-2">
        {isCurrent ? (
          <View className="bg-[#475569] px-4 py-2 rounded-full">
            <Text className="text-white text-[12px] font-bold">Start</Text>
          </View>
        ) : !isLocked ? (
          <ChevronRight size={20} color="#94A3B8" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};
