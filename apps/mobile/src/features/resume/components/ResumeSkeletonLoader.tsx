import React from "react";
import { View, Text, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface ResumeSkeletonLoaderProps {
  text?: string;
}

export function ResumeSkeletonLoader({ text = "Analysing Resume..." }: ResumeSkeletonLoaderProps) {
  const { isDark } = useThemeToggle();

  return (
    <View
      style={[styles.skeletonLoaderContainer, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}
    >
      <View
        style={[
          styles.skeletonPaper,
          { backgroundColor: isDark ? "#1e293b" : "white" },
          Platform.OS === "web" ? ({ filter: "blur(4px)" } as never) : {},
        ]}
      >
        {/* Left sidebar block */}
        <View
          style={[styles.skeletonSidebar, { backgroundColor: isDark ? "#334155" : "#3b82f6" }]}
        />

        {/* Right content blocks */}
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonRow}>
            <View
              style={[
                styles.skeletonBlock,
                { flex: 1, height: 40, backgroundColor: isDark ? "#475569" : "#cbd5e1" },
              ]}
            />
            <View
              style={[
                styles.skeletonBlock,
                { flex: 0.8, height: 40, backgroundColor: isDark ? "#475569" : "#cbd5e1" },
              ]}
            />
          </View>
          <View
            style={[
              styles.skeletonBlock,
              { height: 60, backgroundColor: isDark ? "#475569" : "#cbd5e1" },
            ]}
          />
          <View
            style={[
              styles.skeletonBlock,
              { height: 60, backgroundColor: isDark ? "#475569" : "#cbd5e1" },
            ]}
          />
          <View
            style={[
              styles.skeletonBlock,
              { height: 60, backgroundColor: isDark ? "#475569" : "#cbd5e1" },
            ]}
          />
          <View style={styles.skeletonRow}>
            <View
              style={[
                styles.skeletonBlock,
                { flex: 1, height: 40, backgroundColor: isDark ? "#475569" : "#cbd5e1" },
              ]}
            />
            <View
              style={[
                styles.skeletonBlock,
                { flex: 1, height: 40, backgroundColor: isDark ? "#475569" : "#cbd5e1" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Overlay with Text and Spinner directly on frosted glass */}
      <View
        style={[
          styles.skeletonOverlay,
          { backgroundColor: isDark ? "rgba(15,23,42,0.8)" : "rgba(248,250,252,0.8)" },
        ]}
      >
        <Text style={[styles.analyzingText, { color: isDark ? "#f8fafc" : "#475569" }]}>
          {text}
        </Text>
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#3b82f6"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonLoaderContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  skeletonPaper: {
    width: "100%",
    maxWidth: 500, // Max width of the "paper"
    aspectRatio: 1 / 1.414, // A4 aspect ratio
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  skeletonSidebar: {
    width: 60,
    height: "100%",
  },
  skeletonContent: {
    flex: 1,
    gap: 32,
    padding: 48,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 32,
  },
  skeletonBlock: {
    borderRadius: 8,
  },
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingText: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
});
