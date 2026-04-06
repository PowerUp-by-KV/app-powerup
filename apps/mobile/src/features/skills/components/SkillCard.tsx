import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { Card } from "@/features/learning/components";
import { COLORS, FONTS } from "@/constants/theme";

interface SkillCardProps {
  skill: string;
  level: number;
}

const SkillCard = ({ skill, level }: SkillCardProps) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.skill}>{skill}</Text>
      <View style={styles.levelContainer}>
        <Text style={styles.level}>Level {level}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginRight: 15,
    width: 150,
  },
  skill: {
    fontSize: 14,
    ...FONTS.bold,
  },
  levelContainer: {
    marginTop: 10,
  },
  level: {
    fontSize: 12,
    color: COLORS.primary,
  },
});

export default SkillCard;
