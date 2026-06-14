import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";

interface SelectionListCardProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function SelectionListCard({ label, isSelected, onPress }: SelectionListCardProps) {
  return (
    <Pressable style={[styles.card, isSelected && styles.cardSelected]} onPress={onPress}>
      <Text style={[styles.text, isSelected && styles.textSelected]}>{label}</Text>
      {isSelected && (
        <View style={styles.iconContainer}>
          <MaterialIcons name="check" size={20} color="#111827" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "white",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  textSelected: {
    color: "#111827",
    fontWeight: "700",
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a3e635",
    borderRadius: 14,
  },
});
