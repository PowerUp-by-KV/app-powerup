import React from "react";
import { View, Text } from "react-native";
import { BookOpen, Trophy, Flame } from "lucide-react-native";

interface ProfileStatsProps {
  user: any;
}

export const ProfileStats = ({ user }: ProfileStatsProps) => {
  const stats = [
    {
      label: "Lessons",
      value: user.completedLessons || 0,
      icon: <BookOpen size={20} color="#6366F1" />,
      bg: "#EEF2FF",
    },
    {
      label: "Streak",
      value: user.streak || 0,
      icon: <Flame size={20} color="#FF8C42" />,
      bg: "#FFF7ED",
    },
    {
      label: "Rank",
      value: `#${user.rank || "---"}`,
      icon: <Trophy size={20} color="#F59E0B" />,
      bg: "#FFFBEB",
    },
  ];

  return (
    <View className="px-5 mb-[30px]">
      <View className="flex-row justify-between bg-white rounded-[30px] p-5 shadow-sm shadow-black/5 elevation-3">
        {stats.map((stat, index) => (
          <View key={index} className="items-center flex-1">
            <View
              style={{ backgroundColor: stat.bg }}
              className="w-11 h-11 rounded-[14px] justify-center items-center mb-2"
            >
              {stat.icon}
            </View>
            <Text className="text-lg text-[#1E293B] font-bold">{stat.value}</Text>
            <Text className="text-[11px] text-[#64748B] font-medium mt-0.5">{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
