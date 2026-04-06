import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import PathNode from "./PathNode";
import PathConnector from "./PathConnector";
import { Play, Star } from "lucide-react-native";

const { width } = Dimensions.get("window");

const LearningPath = ({ data, onNodePress, onContinuePress }) => {
  const NODE_SIZE = 80; // Approximate size with labels
  const NODE_SPACING_Y = 120;
  const X_OFFSET = width * 0.25; // How much it zig-zags left/right

  const getNodePosition = (index) => {
    const row = index;
    let x = width / 2;

    // Zig-zag pattern: Center (0) -> Left (1) -> Right (2) -> Left (3) ...
    if (index === 0) x = width / 2;
    else if (index % 2 === 1) x -= X_OFFSET;
    else x += X_OFFSET;

    return { x, y: row * NODE_SPACING_Y + 50 };
  };

  const completedCount = data.filter((item) => item.status === "completed").length;
  const progressPercent = Math.round((completedCount / data.length) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.sectionTitle}>Learning Path</Text>
          <Text style={styles.progressValue}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <View style={styles.pathContainer}>
        {/* Render Connectors first so they are behind nodes */}
        {data.map((item, index) => {
          if (index === data.length - 1) return null;
          const start = getNodePosition(index);
          const end = getNodePosition(index + 1);
          const isFilled = item.status === "completed";
          return (
            <PathConnector
              key={`conn-${index}`}
              startPos={start}
              endPos={end}
              isFilled={isFilled}
            />
          );
        })}

        {/* Render Nodes */}
        {data.map((item, index) => {
          const pos = getNodePosition(index);
          return (
            <View key={item.id} style={[styles.nodeWrapper, { left: pos.x - 60, top: pos.y }]}>
              <PathNode
                item={item}
                isCurrent={item.status === "current"}
                onPress={() => onNodePress(item)}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={onContinuePress}
        >
          <Text style={styles.continueText}>Continue Learning</Text>
          <Play size={18} color={COLORS.white} fill={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    // Neumorphism style shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    ...FONTS.bold,
    color: COLORS.black,
  },
  progressValue: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  pathContainer: {
    height: 500, // Fixed height or calculated based on data
    width: "100%",
    marginVertical: 20,
    position: "relative",
  },
  nodeWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
    width: "100%",
    justifyContent: "center",
    // Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.bold,
    marginRight: 10,
  },
});

export default LearningPath;
