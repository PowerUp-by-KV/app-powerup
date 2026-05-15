import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface StatTileProps {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
}

export function StatTile({ label, value, icon, onPress }: StatTileProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-slate-900 rounded-2xl p-4 active:opacity-85"
      style={{ minHeight: 86 }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          {label}
        </Text>
        <Feather name={icon} size={16} color="#94a3b8" />
      </View>
      <Text className="text-white text-2xl font-extrabold">{value}</Text>
    </Pressable>
  );
}
