import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Badge } from "@/services/types";

interface BadgeGridProps {
  badges: Badge[];
  title: string;
  onBadgePress?: (badge: Badge) => void;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, title, onBadgePress }) => {
  const renderItem = ({ item }: { item: Badge }) => (
    <TouchableOpacity
      className="w-[22%] mr-[3%] items-center mb-[15px]"
      activeOpacity={0.7}
      onPress={() => onBadgePress?.(item)}
      disabled={item.isLocked && !onBadgePress}
    >
      <View
        className={`w-[60px] h-[60px] rounded-[15px] justify-center items-center mb-2 ${
          item.isLocked
            ? "bg-[#E2E8F0] opacity-60"
            : "bg-white shadow-sm shadow-black/10 elevation-3"
        }`}
      >
        <Text className="text-[30px]">{item.isLocked ? "🔒" : item.icon}</Text>
      </View>
      <Text className="text-[11px] font-medium text-[#475569] text-center" numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="mb-5">
      <Text className="text-lg font-bold text-black mb-[15px]">
        {title} ({badges.length})
      </Text>
      <FlatList
        data={badges}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={4}
        scrollEnabled={false}
        columnWrapperStyle={{ justifyContent: "flex-start" }}
      />
    </View>
  );
};
