import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Check, Star, Book, Lock } from "lucide-react-native";

interface PathNodeProps {
  item: {
    id: number | string;
    title: string;
    status: "completed" | "current" | "locked";
    type?: "start" | "node";
  };
  onPress: () => void;
  isCurrent: boolean;
}

export const PathNode = ({ item, onPress, isCurrent }: PathNodeProps) => {
  const { title, status, type } = item;
  const isCompleted = status === "completed";
  const isLocked = status === "locked";

  const handlePress = () => {
    if (isCurrent) {
      onPress();
    } else if (isLocked) {
      Alert.alert("Locked", "Complete previous step");
    }
  };

  const renderIcon = () => {
    if (isLocked) return <Lock size={20} color="#94A3B8" />;
    if (isCompleted) return <Check size={24} color="#FFF" strokeWidth={3} />;
    if (type === "start")
      return (
        <Star
          size={24}
          color={isCurrent ? "#FFF" : "#F59E0B"}
          fill={isCurrent ? "#FFF" : "#F59E0B"}
        />
      );
    return <Book size={24} color="#FFF" />;
  };

  const getBackgroundColor = () => {
    if (isCompleted) return "bg-[#10B981]";
    if (isCurrent) return "bg-[#6366F1]";
    return "bg-[#E2E8F0]";
  };

  return (
    <View className="items-center my-5 w-[120px] relative">
      {isCurrent && status !== "locked" && (
        <View className="absolute top-[-55px] items-center z-10">
          <View className="bg-white px-4 py-2 rounded-[20px] shadow-lg shadow-black/15 elevation-8 border border-[#E2E8F0]">
            <Text className="color-black text-[12px] font-bold">START</Text>
          </View>
          <View
            className="w-0 h-0 bg-transparent mt-[-2px]"
            style={{
              borderStyle: "solid",
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderTopWidth: 10,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: "white",
            }}
          />
        </View>
      )}

      <View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePress}
          className={`w-[70px] h-[70px] rounded-[35px] justify-center items-center border-b-[5px] border-black/10 ${getBackgroundColor()} ${
            isCurrent
              ? "shadow-2xl shadow-[#6366F1]/80 elevation-10 border-4 border-[#4A90E2]/30"
              : ""
          } ${isLocked ? "border-b-0" : ""}`}
        >
          {renderIcon()}
        </TouchableOpacity>
      </View>

      <Text
        className={`mt-2.5 text-sm text-center font-bold ${
          isCurrent ? "text-[#6366F1]" : isLocked ? "text-[#94A3B8]" : "text-[#10B981]"
        }`}
      >
        {title}
      </Text>
    </View>
  );
};
