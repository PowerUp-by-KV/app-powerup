import React from "react";
import { TouchableOpacity } from "react-native";
import { MessageCircle } from "lucide-react-native";

interface ChatbotButtonProps {
  onPress: () => void;
}

export const ChatbotButton = ({ onPress }: ChatbotButtonProps) => {
  return (
    <TouchableOpacity
      className="bg-[#6366F1] w-[60px] h-[60px] rounded-full justify-center items-center absolute bottom-5 right-5 shadow-lg shadow-[#6366F1]/40 elevation-5"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MessageCircle color="white" size={24} />
    </TouchableOpacity>
  );
};
