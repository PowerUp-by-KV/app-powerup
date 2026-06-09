import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";

interface TemplatePreviewCardProps {
  title: string;
  subtitle: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

export function TemplatePreviewCard({
  title,
  subtitle,
  icon,
  isSelected,
  onPress,
}: TemplatePreviewCardProps) {
  return (
    <Pressable style={[styles.card, isSelected && styles.cardSelected]} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.emojiIcon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.checkboxContainer}>
          {isSelected && <MaterialIcons name="check-circle" size={24} color="#a3e635" />}
        </View>
      </View>

      {/* Visual representation block inside the template card */}
      <View style={[styles.previewBlock, isSelected && styles.previewBlockSelected]}>
        <View style={styles.previewLineWide} />
        <View style={styles.previewLineShort} />
        <View style={styles.previewDivider} />
        <View style={styles.previewLineFull} />
        <View style={styles.previewLineFull} />
        <View style={styles.previewLineFull} />
        <View style={styles.previewLineFull} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  iconContainer: {
    marginRight: 16,
    paddingTop: 4,
  },
  emojiIcon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    backgroundColor: "white",
  },
  previewBlock: {
    backgroundColor: "#93c5fd",
    borderRadius: 16,
    padding: 20,
    height: 140,
    overflow: "hidden",
  },
  previewBlockSelected: {
    backgroundColor: "#60a5fa",
  },
  previewLineWide: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 3,
    width: "60%",
    marginBottom: 10,
  },
  previewLineShort: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 2,
    width: "40%",
    marginBottom: 16,
  },
  previewDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: "100%",
    marginBottom: 16,
  },
  previewLineFull: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
    width: "90%",
    marginBottom: 8,
  },
});
