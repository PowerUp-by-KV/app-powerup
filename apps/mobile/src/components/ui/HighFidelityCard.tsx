import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Clock } from "lucide-react-native";

export interface HighFidelityCardProps {
  title: string;
  tag?: string;
  duration?: string;
  status: "locked" | "in_progress" | "completed";
  gradient?: readonly [string, string, ...string[]];
  onPress: () => void;
  className?: string;
}

export const HighFidelityCard: React.FC<HighFidelityCardProps> = ({
  title,
  tag,
  duration,
  status,
  gradient = ["#475569", "#94A3B8"],
  onPress,
  className = "",
}) => {
  const isLocked = status === "locked";
  const isInProgress = status === "in_progress";
  const isCompleted = status === "completed";

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.8}
      onPress={isLocked ? undefined : onPress}
      className={`mb-8 rounded-[32px] bg-white shadow-sm overflow-hidden border border-slate-100 ${className}`}
    >
      {/* Card Header Gradient */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-[140px] w-full p-6 justify-end"
      >
        {/* Status Badge */}
        <View className="absolute top-5 right-5">
          <View
            className={`px-4 py-1.5 rounded-full ${
              isLocked ? "bg-[#3B82F6]/60" : isInProgress ? "bg-[#3B82F6]" : "bg-[#10B981]"
            } flex-row items-center shadow-sm`}
          >
            <Text className="text-white text-[12px] font-bold">
              {isLocked ? "Locked" : isInProgress ? "In Progress" : "Completed"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Card Body */}
      <View className="p-6 pt-5">
        <View className="flex-row items-center mb-3">
          {tag && (
            <View className="bg-[#F1F5F9] px-4 py-1.5 rounded-xl mr-auto">
              <Text className="text-[#64748B] text-[13px] font-bold">{tag}</Text>
            </View>
          )}

          {duration && (
            <View className="flex-row items-center opacity-60">
              <Clock size={16} color="#1E293B" className="mr-1.5" />
              <Text className="text-[#1E293B] text-[14px] font-bold">{duration}</Text>
            </View>
          )}
        </View>

        <Text className="text-[22px] font-bold text-[#1E293B] mb-1">{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
