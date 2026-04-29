import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, Pencil, Lock } from "lucide-react-native";
import { ProgressBar } from "@/features/progress/components/ProgressBar";

interface ModuleTimelineItemProps {
  title: string;
  subtitle: string;
  status: "completed" | "in_progress" | "locked";
  lessonsCompleted?: number;
  totalLessons?: number;
  xpEarned?: number;
  isLast?: boolean;
  onPress?: () => void;
}

export const ModuleTimelineItem = ({
  title,
  subtitle,
  status,
  lessonsCompleted = 0,
  totalLessons = 10,
  xpEarned = 0,
  isLast = false,
  onPress,
}: ModuleTimelineItemProps) => {
  const getStatusBadge = () => {
    const baseClasses = "px-3 py-1 rounded-full";
    switch (status) {
      case "completed":
        return (
          <View className={`${baseClasses} bg-[#475569]/10 border border-[#475569]/20`}>
            <Text className="text-[#475569] text-[10px] font-bold">Completed</Text>
          </View>
        );
      case "in_progress":
        return (
          <View className={`${baseClasses} bg-[#475569] shadow-sm`}>
            <Text className="text-white text-[10px] font-bold">In Progress</Text>
          </View>
        );
      case "locked":
        return (
          <View className={`${baseClasses} bg-[#64748B]/10`}>
            <Text className="text-[#94A3B8] text-[10px] font-bold">Locked</Text>
          </View>
        );
    }
  };

  const Icon =
    status === "completed"
      ? Check
      : status === "locked" && title.toLowerCase().includes("resume")
        ? Lock
        : Pencil;
  const progress = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={status === "locked"}
      activeOpacity={0.7}
      className="flex-row mb-3.5"
    >
      {/* Timeline Column */}
      <View className="items-center mr-3">
        <View
          className={`w-9 h-9 rounded-full items-center justify-center border-2 ${
            status === "locked" ? "border-[#E2E8F0] bg-white" : "border-[#475569] bg-[#475569]"
          }`}
        >
          <Icon size={16} color={status === "locked" ? "#94A3B8" : "white"} />
        </View>
        {!isLast && <View className="w-[2px] flex-1 bg-[#E2E8F0] my-1" />}
      </View>

      {/* Content Column */}
      <View className="flex-1 pb-2">
        <View className="flex-row justify-between items-start mb-1">
          <View className="flex-1 mr-2">
            <Text
              className={`text-[17px] font-bold ${status === "locked" ? "text-[#94A3B8]" : "text-[#1E293B]"}`}
            >
              {title}
            </Text>
            <Text className="text-[12px] text-[#94A3B8] font-medium leading-4">{subtitle}</Text>
          </View>
          {getStatusBadge()}
        </View>

        {status === "completed" && (
          <View className="mt-2">
            <ProgressBar progress={100} color="#475569" height={6} className="my-1" />
            <View className="flex-row justify-between">
              <Text className="text-[10px] text-[#94A3B8] font-bold uppercase">
                {totalLessons} lessons completed
              </Text>
              <Text className="text-[10px] text-[#94A3B8] font-bold">100%</Text>
            </View>
            <Text className="text-[12px] text-[#475569] font-bold mt-1">{xpEarned} XP earned</Text>
          </View>
        )}

        {status === "in_progress" && (
          <View className="mt-2">
            <ProgressBar progress={progress} color="#64748B" height={6} className="my-1" />
            <View className="flex-row justify-between">
              <Text className="text-[10px] text-[#94A3B8] font-bold uppercase">
                {lessonsCompleted} lessons completed
              </Text>
              <Text className="text-[10px] text-[#94A3B8] font-bold">{Math.round(progress)}%</Text>
            </View>
            <Text className="text-[12px] text-[#475569] font-bold mt-1">{xpEarned} XP earned</Text>

            <View className="bg-[#475569] py-2.5 rounded-xl items-center mt-3 shadow-sm">
              <Text className="text-white text-xs font-bold">Continue Learning</Text>
            </View>
          </View>
        )}

        {status === "locked" && (
          <Text className="text-[12px] text-[#94A3B8] font-medium mt-2 italic">
            Complete previous stages to unlock
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
