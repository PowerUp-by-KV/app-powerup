import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/features/learning/components";

interface SkillCardProps {
  skill: string;
  level: number;
}

export const SkillCard = ({ skill, level }: SkillCardProps) => {
  return (
    <Card className="p-[15px] mr-[15px] w-[150px]">
      <Text className="text-sm font-bold text-black">{skill}</Text>
      <View className="mt-2.5">
        <Text className="text-[12px] text-[#6366F1]">Level {level}</Text>
      </View>
    </Card>
  );
};
