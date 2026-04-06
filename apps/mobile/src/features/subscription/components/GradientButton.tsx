import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS } from "@/constants/theme";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: string[];
  style?: any;
  textStyle?: any;
}

export const GradientButton = ({
  title,
  onPress,
  colors,
  style,
  textStyle,
}: GradientButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, style]}>
      <LinearGradient
        colors={(colors || [COLORS.primary, "#357ABD"]) as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radius,
    overflow: "hidden",
    width: "100%",
    marginVertical: 10,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: SIZES.padding,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.semiBold,
  },
});
