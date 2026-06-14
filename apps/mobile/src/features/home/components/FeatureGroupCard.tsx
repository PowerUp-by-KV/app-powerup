import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface SubItem {
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface FeatureGroupCardProps {
  title: string;
  subtitle: string;
  icon: string;
  items: SubItem[];
}

export function FeatureGroupCard({ title, subtitle, icon, items }: FeatureGroupCardProps) {
  const renderIcon = () => {
    if (icon === "✨") {
      return <Ionicons name="sparkles" size={22} color="#ffffff" />;
    }
    if (icon === "📝") {
      return <Feather name="edit-3" size={22} color="#ffffff" />;
    }
    return <Text className="text-xl">{icon}</Text>;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerIconContainer}
        >
          {renderIcon()}
        </LinearGradient>
        <View style={styles.headerText}>
          <Text className="text-slate-900 font-bold text-base">{title}</Text>
          <Text className="text-slate-500 text-xs mt-0.5">{subtitle}</Text>
        </View>
      </View>
      <View>
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={item.onPress}
            style={[styles.itemPressable, { marginBottom: i === items.length - 1 ? 0 : 12 }]}
            className="active:scale-[0.98]"
          >
            <View style={styles.itemTextContainer}>
              <Text className="text-slate-800 font-bold text-sm tracking-tight">{item.title}</Text>
              <Text className="text-slate-400 text-xs font-semibold mt-1">{item.subtitle}</Text>
            </View>
            <View style={styles.chevronContainer}>
              <Feather name="chevron-right" size={18} color="#1a202c" />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(241, 245, 249, 0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  itemPressable: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(241, 245, 249, 0.8)",
    borderRadius: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  itemTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  chevronContainer: {
    backgroundColor: "#bef264",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#bef264",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1.5,
  },
});
