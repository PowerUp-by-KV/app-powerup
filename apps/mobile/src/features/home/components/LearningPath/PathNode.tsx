import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Check, Star, Book, Lock } from "lucide-react-native";
import { COLORS, FONTS } from "@/constants/theme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const PathNode = ({ item, onPress, isCurrent }) => {
  const { title, status, type } = item;
  const isCompleted = status === "completed";
  const isLocked = status === "locked";

  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCurrent) {
      scale.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [isCurrent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isCurrent) {
      onPress();
    } else if (isLocked) {
      Alert.alert("Locked", "Complete previous step");
    }
    // Completed nodes are not clickable per user request "Only current node should be clickable"
  };

  const renderIcon = () => {
    if (isLocked) return <Lock size={20} color={COLORS.gray} />;
    if (isCompleted) return <Check size={24} color={COLORS.white} strokeWidth={3} />;
    if (type === "start")
      return (
        <Star
          size={24}
          color={isCurrent ? COLORS.white : COLORS.secondary}
          fill={isCurrent ? COLORS.white : COLORS.secondary}
        />
      );
    return <Book size={24} color={COLORS.white} />;
  };

  const getBackgroundColor = () => {
    if (isCompleted) return COLORS.success;
    if (isCurrent) return COLORS.primary;
    return COLORS.lightGray;
  };

  return (
    <View style={styles.container}>
      {isCurrent && status !== "locked" && (
        <View style={styles.startButtonContainer}>
          <View style={styles.startButton}>
            <Text style={styles.startButtonText}>START</Text>
          </View>
          <View style={styles.triangle} />
        </View>
      )}

      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePress}
          style={[
            styles.nodeCircle,
            { backgroundColor: getBackgroundColor() },
            isCurrent && styles.currentGlow,
            isLocked && styles.lockedNode,
          ]}
        >
          {renderIcon()}
        </TouchableOpacity>
      </Animated.View>

      <Text
        style={[
          styles.label,
          isCurrent ? styles.activeLabel : isLocked ? styles.lockedLabel : styles.completedLabel,
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
    width: 120,
    position: "relative",
  },
  nodeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  currentGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 4,
    borderColor: "rgba(74, 144, 226, 0.3)",
  },
  lockedNode: {
    borderBottomWidth: 0,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
    ...FONTS.bold,
  },
  activeLabel: {
    color: COLORS.primary,
  },
  completedLabel: {
    color: COLORS.success,
  },
  lockedLabel: {
    color: COLORS.gray,
  },
  startButtonContainer: {
    position: "absolute",
    top: -55,
    alignItems: "center",
    zIndex: 10,
  },
  startButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  startButtonText: {
    color: COLORS.black,
    fontSize: 12,
    ...FONTS.bold,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.white,
    marginTop: -2,
  },
});

export default PathNode;
