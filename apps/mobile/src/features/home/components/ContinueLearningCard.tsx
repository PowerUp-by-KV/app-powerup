import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface ContinueLearningCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function ContinueLearningCard({ title, subtitle, onPress }: ContinueLearningCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card} className="active:scale-[0.98]">
      <LinearGradient
        colors={["#4f46e5", "#3b82f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <Feather name="book-open" size={22} color="#ffffff" />
      </LinearGradient>
      <View style={styles.textContainer}>
        <Text className="text-slate-900 font-bold text-base">{title}</Text>
        <Text className="text-slate-500 text-xs mt-1">{subtitle}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Feather name="chevron-right" size={22} color="#1a202c" />
      </View>
    </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  arrowContainer: {
    backgroundColor: "#bef264",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#bef264",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});
