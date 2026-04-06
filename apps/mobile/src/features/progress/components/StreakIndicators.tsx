import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Zap } from "lucide-react-native";
import { COLORS, FONTS } from "@/constants/theme";

interface StreakIndicatorProps {
  days: number;
}

export const StreakIndicators: React.FC<StreakIndicatorProps> = ({ days }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Zap size={24} color={COLORS.quaternary} fill={COLORS.quaternary} />
        <Text style={styles.title}>{days} Day Streak!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    ...FONTS.bold,
    color: COLORS.black,
    marginLeft: 10,
  },
});
