import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { Badge } from "@/services/types";

interface BadgeGridProps {
  badges: Badge[];
  title: string;
  onBadgePress?: (badge: Badge) => void;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, title, onBadgePress }) => {
  const renderItem = ({ item }: { item: Badge }) => (
    <TouchableOpacity
      style={styles.badgeItem}
      activeOpacity={0.7}
      onPress={() => onBadgePress?.(item)}
      disabled={item.isLocked && !onBadgePress}
    >
      <View
        style={[styles.badgeIconContainer, item.isLocked ? styles.badgeLocked : styles.badgeEarned]}
      >
        <Text style={styles.badgeEmoji}>{item.isLocked ? "🔒" : item.icon}</Text>
      </View>
      <Text style={styles.badgeTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {title} ({badges.length})
      </Text>
      <FlatList
        data={badges}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={4}
        scrollEnabled={false}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    ...FONTS.bold,
    color: COLORS.black,
    marginBottom: 15,
  },
  columnWrapper: {
    justifyContent: "flex-start",
  },
  badgeItem: {
    width: "22%",
    marginRight: "3%",
    alignItems: "center",
    marginBottom: 15,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeEarned: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeLocked: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 30,
  },
  badgeTitle: {
    fontSize: 11,
    ...FONTS.medium,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});
