import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BookOpen, Zap, Award, Target, Flame, Trophy } from "lucide-react-native";
import { COLORS, FONTS } from "@/constants/theme";

export const ProfileStats = ({ user }) => {
  const stats = [
    {
      label: "Lessons",
      value: user.completedLessons,
      icon: <BookOpen size={20} color="#6366F1" />,
      bg: "#EEF2FF",
    },
    {
      label: "Streak",
      value: user.streak,
      icon: <Flame size={20} color="#FF8C42" />,
      bg: "#FFF7ED",
    },
    {
      label: "Rank",
      value: `#${user.rank}`,
      icon: <Trophy size={20} color="#F59E0B" />,
      bg: "#FFFBEB",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: stat.bg }]}>{stat.icon}</View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    color: "#1E293B",
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    ...FONTS.medium,
    marginTop: 2,
  },
});
