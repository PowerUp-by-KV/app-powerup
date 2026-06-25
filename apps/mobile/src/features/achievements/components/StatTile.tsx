import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

interface StatTileProps {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
}

export function StatTile({ label, value, icon, onPress }: StatTileProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-3xl p-4 active:opacity-85 overflow-hidden border shadow-sm
        ${
          isDark
            ? "bg-[#1A1B31] border-[rgba(113,116,246,0.15)] shadow-none"
            : "bg-white border-[#ECEEF8] shadow-[#7174F6]/5"
        }`}
      style={{ minHeight: 90, position: "relative" }}
    >
      <View className="z-10 flex-1 justify-between">
        <Text
          className={`text-xs font-bold uppercase tracking-wider 
            ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}
        >
          {label}
        </Text>
        <Text className="text-2xl font-black mt-1 text-[#7174F6]">{value}</Text>
      </View>
      <View style={{ position: "absolute", right: 10, bottom: -10, opacity: isDark ? 0.12 : 0.08 }}>
        <Feather name={icon} size={64} color="#7174F6" />
      </View>
    </Pressable>
  );
}
