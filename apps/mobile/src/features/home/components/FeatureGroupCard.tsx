import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SubItem {
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface FeatureGroupCardProps {
  title: string;
  subtitle: string;
  icon: string;
  items: SubItem[];
}

export function FeatureGroupCard({ title, subtitle, icon, items }: FeatureGroupCardProps) {
  return (
    <View className="bg-white rounded-3xl p-4 border border-slate-100 mb-4">
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center mr-3">
          <Text className="text-xl">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-900 font-bold text-base">{title}</Text>
          <Text className="text-slate-500 text-xs">{subtitle}</Text>
        </View>
      </View>
      <View>
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={item.onPress}
            className="flex-row items-center justify-between py-3 active:opacity-70"
            style={{ borderTopWidth: i === 0 ? 1 : 0, borderColor: "#f1f5f9" }}
          >
            <View className="flex-1 pr-3">
              <Text className="text-slate-900 font-semibold">{item.title}</Text>
              <Text className="text-slate-400 text-xs">{item.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
