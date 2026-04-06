import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Icons from "lucide-react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { selectTimeForModule } from "@/store/slices/timeTrackingSlice";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 16) / 2; // (width - total horizontal padding - gap) / 2

interface ModuleCardProps {
  moduleId: string;
  title: string;
  subtitle: string;
  icon: string;
  colors: readonly string[] | string[];
  progress: number; // 0-100
  onPress: () => void;
}

/**
 * Modern Grid-based Module Card component.
 * Displays real-time progress and study duration from Redux.
 */
export const ModuleCard = ({
  moduleId,
  title,
  subtitle,
  icon,
  colors,
  progress,
  onPress,
}: ModuleCardProps) => {
  const seconds = useSelector((state: RootState) => selectTimeForModule(state, moduleId));

  const formattedTime =
    seconds < 60 ? `${seconds}s today` : `${Math.floor(seconds / 60)} min today`;

  // Dynamically get the icon component from lucide-react-native
  const iconName = icon
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  const IconComponent = (Icons as any)[iconName] || Icons.Book;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{ width: CARD_WIDTH }}
      className="mb-4"
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        className="p-5 rounded-[32px] h-52 justify-between shadow-lg shadow-black/10"
      >
        <View className="flex-row justify-between items-start">
          <View className="w-11 h-11 bg-white/25 rounded-2xl items-center justify-center">
            <IconComponent size={22} color="white" strokeWidth={2.5} />
          </View>
        </View>

        <View>
          <Text className="text-white text-lg font-bold capitalize leading-tight">{title}</Text>
          <Text className="text-white/70 text-[10px] font-medium mt-1 mb-3" numberOfLines={1}>
            {subtitle}
          </Text>

          {/* Progress Bar Container */}
          <View className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-2">
            <View style={{ width: `${progress}%` }} className="h-full bg-white rounded-full" />
          </View>

          {/* Time Spent Stats */}
          <View className="flex-row items-center opacity-90">
            <Icons.Clock size={10} color="white" />
            <Text className="text-white text-[10px] font-bold ml-1">{formattedTime}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
