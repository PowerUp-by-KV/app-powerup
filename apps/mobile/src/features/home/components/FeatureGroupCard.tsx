import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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

import { useColorScheme } from "nativewind";

export function FeatureGroupCard({ title, subtitle, icon, items }: FeatureGroupCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
    <View className="bg-white dark:bg-[#16161c] border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-5 mb-4 shadow-sm shadow-slate-100 dark:shadow-none">
      <View className="flex-row items-center mb-5">
        <LinearGradient
          colors={isDark ? ["#3b82f6", "#2563eb"] : ["#4f46e5", "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-12 h-12 rounded-full items-center justify-center mr-3.5 shadow-sm shadow-indigo-100 dark:shadow-none"
        >
          {renderIcon()}
        </LinearGradient>
        <View className="flex-1">
          <Text className="text-slate-900 dark:text-white font-bold text-base">{title}</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{subtitle}</Text>
        </View>
      </View>
      <View>
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={item.onPress}
            style={{ marginBottom: i === items.length - 1 ? 0 : 12 }}
            className="flex-row items-center p-4 bg-[#f8fafc] dark:bg-[#202029] border border-slate-100/50 dark:border-[#2d2d3a] rounded-[16px] active:scale-[0.98] shadow-sm shadow-slate-100/20 dark:shadow-none"
          >
            <View className="flex-1 pr-3">
              <Text className="text-slate-800 dark:text-white font-bold text-sm tracking-tight">
                {item.title}
              </Text>
              <Text className="text-slate-400 dark:text-slate-400 text-xs font-semibold mt-1">
                {item.subtitle}
              </Text>
            </View>
            <View className="bg-[#bef264] w-8 h-8 rounded-full items-center justify-center shadow-sm shadow-[#bef264]/20">
              <Feather name="chevron-right" size={18} color="#1a202c" />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
