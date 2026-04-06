import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "./Card";

interface LessonCardProps {
  title: string;
  onPress: () => void;
  status?: "completed" | "in-progress" | "locked";
}

export const LessonCard = ({ title, onPress, status }: LessonCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-[#22C55E]";
      case "in-progress":
        return "text-[#6366F1]";
      case "locked":
        return "text-[#94A3B8]";
      default:
        return "text-[#64748B]";
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-2.5">
      <Card className="p-4 rounded-xl border border-[#F1F5F9] bg-white shadow-sm shadow-black/5">
        <Text className="text-base text-black font-bold mb-1">{title}</Text>
        <Text className={`text-xs font-medium uppercase tracking-wider ${getStatusColor()}`}>
          {status || "available"}
        </Text>
      </Card>
    </TouchableOpacity>
  );
};
