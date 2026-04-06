import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bot } from "lucide-react-native";
import { COLORS, GRADIENTS, FONTS } from "@/constants/theme";

interface AIButtonProps {
  onPress: () => void;
}

export const AIButton = ({ onPress }: AIButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <LinearGradient colors={GRADIENTS.quest as any} style={styles.gradient}>
        <Bot size={30} color={COLORS.white} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: 20,
    borderRadius: 30,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
