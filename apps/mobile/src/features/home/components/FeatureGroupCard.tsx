import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

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
  // Render clean vector icon if matches emoji, otherwise fallback to emoji character
  const renderIcon = () => {
    if (icon === "✨") {
      return <Ionicons name="sparkles" size={22} color="#ffffff" />;
    }
    if (icon === "📝") {
      return <Feather name="edit-3" size={22} color="#ffffff" />;
    }
    return <Text className="text-xl">{icon}</Text>;
  };

  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-100 mb-4 shadow-sm shadow-slate-100">
      <View className="flex-row items-center mb-5">
        <View className="w-12 h-12 rounded-full bg-indigo-600 items-center justify-center mr-3.5 shadow-sm shadow-indigo-100/20">
          {renderIcon()}
        </View>
        <View className="flex-1">
          <Text className="text-slate-900 font-bold text-base">{title}</Text>
          <Text className="text-slate-500 text-xs mt-0.5">{subtitle}</Text>
        </View>
      </View>
      <View>
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={item.onPress}
            className={`flex-row items-center justify-between p-4 bg-slate-50 border border-slate-100/60 rounded-2xl active:scale-[0.98] shadow-sm shadow-slate-100/10 ${
              i === items.length - 1 ? "" : "mb-3"
            }`}
          >
            <View className="flex-1 pr-3">
              <Text className="text-slate-800 font-bold text-sm tracking-tight">{item.title}</Text>
              <Text className="text-slate-400 text-xs font-semibold mt-1">{item.subtitle}</Text>
            </View>
            <View
              style={{ backgroundColor: "#bef264" }}
              className="w-8 h-8 rounded-full items-center justify-center shadow-sm shadow-lime-300/10"
            >
              <Feather name="chevron-right" size={18} color="#1a202c" />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
