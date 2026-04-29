import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Bot } from "lucide-react-native";

interface AIButtonProps {
  onPress: () => void;
}

export const AIButton = ({ onPress }: AIButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="absolute bottom-[20px] left-5 rounded-[30px] shadow-lg shadow-black/30 elevation-8"
    >
      <View className="w-[60px] h-[60px] rounded-[30px] items-center justify-center bg-[#6366F1]">
        <Bot size={30} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};
