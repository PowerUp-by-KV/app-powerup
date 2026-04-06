import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";

interface CEFRLevelBarProps {
  currentLevel: string;
}

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const CEFRLevelBar: React.FC<CEFRLevelBarProps> = ({ currentLevel }) => {
  const currentIndex = levels.indexOf(currentLevel) === -1 ? 2 : levels.indexOf(currentLevel);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CEFR Level: {currentLevel} (Intermediate)</Text>
      <View style={styles.barContainer}>
        <View style={styles.track} />
        <View
          style={[
            styles.progressTrack,
            { width: `${(currentIndex / (levels.length - 1)) * 100}%` },
          ]}
        />
        <View style={styles.levelsRow}>
          {levels.map((level, index) => (
            <View key={level} style={styles.levelItem}>
              <View
                style={[
                  styles.dot,
                  index <= currentIndex ? styles.dotActive : styles.dotInactive,
                  index === currentIndex ? styles.dotCurrent : null,
                ]}
              />
              <Text
                style={[styles.levelText, index === currentIndex ? styles.levelTextActive : null]}
              >
                {level}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: 16,
    ...FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 20,
  },
  barContainer: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    height: 4,
    left: 0,
    right: 0,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
  },
  progressTrack: {
    position: "absolute",
    height: 4,
    left: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  levelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelItem: {
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginBottom: 4,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    backgroundColor: COLORS.lightGray,
  },
  dotCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    transform: [{ translateY: -2 }],
    zIndex: 1,
  },
  levelText: {
    fontSize: 12,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  levelTextActive: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
});
