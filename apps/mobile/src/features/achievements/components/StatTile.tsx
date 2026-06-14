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
      className="flex-1 bg-[#f0f2fe] rounded-3xl p-4 active:opacity-85 overflow-hidden border border-[#e2e8f0]/40 shadow-xs"
      style={{ minHeight: 90, position: "relative" }}
    >
      <View className="z-10 flex-1 justify-between">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</Text>
        <Text className="text-slate-800 text-2xl font-black mt-1">{value}</Text>
      </View>
      <View style={{ position: "absolute", right: 10, bottom: -10, opacity: 0.08 }}>
        <Feather name={icon} size={64} color="#4f46e5" />
      </View>
    </Pressable>
  );
}
