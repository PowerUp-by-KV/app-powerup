import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { COLORS, FONTS, SIZES } from "@/constants/theme";

export const ProfileMenu = ({ menuItems }) => {
  return (
    <View style={styles.container}>
      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index === menuItems.length - 1 && styles.lastItem]}
            onPress={item.onPress}
            activeOpacity={0.6}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, item.isDestructive && { backgroundColor: "#FEE2E2" }]}>
                {item.icon}
              </View>
              <Text style={[styles.menuLabel, item.isDestructive && { color: "#EF4444" }]}>
                {item.label}
              </Text>
            </View>
            {!item.isDestructive && <ChevronRight size={18} color="#CBD5E1" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  menuCard: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 16,
    color: "#334155",
    marginLeft: 15,
    ...FONTS.bold,
  },
});
