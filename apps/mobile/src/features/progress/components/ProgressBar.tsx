import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { COLORS, SIZES, FONTS } from "@/constants/theme";

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
  style?: any;
}

const ProgressBar = ({ progress, label, color, style }: ProgressBarProps) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barForeground,
            {
              width: `${Math.min(100, progress)}%`,
              backgroundColor: color || COLORS.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 5,
    ...FONTS.medium,
  },
  barBackground: {
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    overflow: "hidden",
  },
  barForeground: {
    height: "100%",
    borderRadius: 5,
  },
});

export default ProgressBar;
