import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MessageCircle } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

interface ChatbotButtonProps {
  onPress: () => void;
}

export const ChatbotButton = ({ onPress }: ChatbotButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <MessageCircle color={COLORS.white} size={24} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 5,
  },
});
