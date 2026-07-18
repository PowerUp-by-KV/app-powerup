import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Step0AnalysingResumeProps {
  onNext: () => void;
}

export function Step0AnalysingResume({ onNext }: Step0AnalysingResumeProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(onNext, 3000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      className="bg-lumino-light-bg dark:bg-lumino-dark-bg"
    >
      {/* Top placeholder blocks — simulating resume thumbnails */}
      <View style={styles.placeholderSection}>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "60%", height: 14 }]}
            className="bg-gray-300 dark:bg-gray-600"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "80%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "75%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "45%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
        <View style={[styles.placeholderRow, { marginTop: 16 }]}>
          <View
            style={[styles.placeholderBlock, { width: "50%", height: 14 }]}
            className="bg-gray-300 dark:bg-gray-600"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "90%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "85%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
      </View>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text
          style={styles.analysingText}
          className="text-lumino-light-text dark:text-lumino-dark-text"
        >
          Analysing Resume...
        </Text>
        <ActivityIndicator size="large" color="#7174F6" style={styles.spinner} />
      </View>

      {/* Bottom placeholder blocks */}
      <View style={styles.placeholderSection}>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "55%", height: 14 }]}
            className="bg-gray-300 dark:bg-gray-600"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "70%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "65%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "40%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
        <View style={[styles.placeholderRow, { marginTop: 16 }]}>
          <View
            style={[styles.placeholderBlock, { width: "48%", height: 14 }]}
            className="bg-gray-300 dark:bg-gray-600"
          />
        </View>
        <View style={styles.placeholderRow}>
          <View
            style={[styles.placeholderBlock, { width: "82%", height: 10 }]}
            className="bg-gray-200 dark:bg-gray-700"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: undefined,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  placeholderSection: {
    gap: 8,
  },
  placeholderRow: {
    flexDirection: "row",
  },
  placeholderBlock: {
    borderRadius: 4,
    backgroundColor: undefined,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  analysingText: {
    fontSize: 18,
    fontWeight: "600",
    color: undefined,
    textAlign: "center",
  },
  spinner: {
    marginTop: 16,
  },
});
