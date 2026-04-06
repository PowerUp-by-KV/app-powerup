import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import Card from "./Card";
import { COLORS, FONTS } from "@/constants/theme";

interface LessonCardProps {
  title: string;
  onPress: () => void;
  status?: "completed" | "in-progress" | "locked";
}

const LessonCard = ({ title, onPress, status }: LessonCardProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.status}>{status || "available"}</Text>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    ...FONTS.bold,
  },
  status: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 5,
  },
});

export default LessonCard;
