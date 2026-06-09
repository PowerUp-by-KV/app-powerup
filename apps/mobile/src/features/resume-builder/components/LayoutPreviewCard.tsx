import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Text } from "@/components/Themed";

interface LayoutPreviewCardProps {
  label: string;
  type: "single" | "double";
  isSelected: boolean;
  onPress: () => void;
}

export function LayoutPreviewCard({ label, type, isSelected, onPress }: LayoutPreviewCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>

      <View style={[styles.card, isSelected && styles.cardSelected]}>
        {type === "double" ? (
          <View style={styles.doubleColumn}>
            <View style={styles.sidebar}>
              <View style={styles.lineSmall} />
              <View style={styles.lineSmall} />
              <View style={styles.lineSmall} />
              <View style={styles.lineSmall} />
            </View>
            <View style={styles.mainColumn}>
              <View style={styles.lineWide} />
              <View style={styles.lineWide} />
              <View style={styles.lineWide} />
              <View style={styles.lineWide} />
              <View style={styles.lineWide} />
            </View>
          </View>
        ) : (
          <View style={styles.singleColumn}>
            <View style={styles.lineFull} />
            <View style={styles.lineFull} />
            <View style={styles.lineFull} />
            <View style={styles.lineFull} />
            <View style={styles.lineFull} />
            <View style={styles.lineFull} />
            <View style={styles.lineFull} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 16,
  },
  labelSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
  card: {
    width: "100%",
    aspectRatio: 0.7, // Portrait rectangle
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    padding: 12,
  },
  cardSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  doubleColumn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#9ca3af",
    borderRadius: 4,
    padding: 6,
    gap: 6,
  },
  mainColumn: {
    flex: 2,
    gap: 6,
    paddingTop: 6,
  },
  singleColumn: {
    flex: 1,
    gap: 8,
    paddingTop: 8,
    alignItems: "center",
  },
  lineSmall: {
    height: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    width: "80%",
  },
  lineWide: {
    height: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    width: "100%",
  },
  lineFull: {
    height: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    width: "90%",
  },
});
