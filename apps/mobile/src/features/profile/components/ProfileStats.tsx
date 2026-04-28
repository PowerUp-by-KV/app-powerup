import React from "react";
import { View, Text } from "react-native";
import { Flame, Trophy, Users } from "lucide-react-native";
import { UserProfile } from "@/services/types";

interface ProfileStatsProps {
  user: UserProfile;
}

export const ProfileStats = ({ user }: ProfileStatsProps) => {
  const stats = [
    {
      label: "Daily Streak",
      value: user.streak || 205,
      icon: <Flame size={20} color="#334155" />,
    },
    {
      label: "XP Points",
      value: user.xp || 20,
      icon: <Trophy size={20} color="#334155" />,
    },
    {
      label: "Friends",
      value: user.friendsCount || 17,
      icon: <Users size={20} color="#334155" />,
    },
  ];

  return (
    <View className="flex-row justify-between px-5 mb-8">
      {stats.map((stat, index) => (
        <View
          key={index}
          className="flex-1 mr-2 last:mr-0 bg-slate-200 rounded-2xl py-2 px-2 flex-row items-center justify-center h-14"
        >
          <View className="w-7 h-7 bg-slate-400 rounded-lg items-center justify-center mr-1.5 overflow-hidden">
            {stat.icon}
          </View>
          <View className="flex-1">
            <Text className="text-[13px] text-slate-800 font-bold leading-none">{stat.value}</Text>
            <Text className="text-[8px] text-slate-500 font-bold leading-tight uppercase mt-0.5">
              {stat.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
