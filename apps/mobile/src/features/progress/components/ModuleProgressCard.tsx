import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/components/ui";
import { ProgressBar } from "@/features/progress/components";

interface ModuleProgressCardProps {
  name: string;
  percentage: number;
  status: string;
}

export const ModuleProgressCard: React.FC<ModuleProgressCardProps> = ({
  name,
  percentage,
  status,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "Mastery":
        return "#10B981"; // success
      case "Done":
        return "#6366F1"; // primary
      default:
        return "#F59E0B"; // warning
    }
  };

  const statusColor = getStatusColor();

  return (
    <Card className="w-[48.5%] mb-[15px] p-3 shadow-md elevation-3">
      <Text className="text-base font-bold text-black mb-2">{name}</Text>
      <View className="flex-row items-center mb-2.5">
        <View className="flex-1 mr-2">
          <ProgressBar progress={percentage} color="#6366F1" />
        </View>
        <Text className="text-[12px] font-medium text-[#64748B]">{percentage}%</Text>
      </View>
      <View
        style={{ backgroundColor: `${statusColor}15` }}
        className="self-start px-2 py-1 rounded-lg"
      >
        <Text style={{ color: statusColor }} className="text-[12px] font-bold">
          {status === "Mastery" ? "⭐ " : status === "Done" ? "✅ " : ""}
          {status}
        </Text>
      </View>
    </Card>
  );
};
