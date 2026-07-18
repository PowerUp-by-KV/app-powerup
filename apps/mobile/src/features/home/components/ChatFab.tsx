import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

interface ChatFabProps {
  onPress: () => void;
}

export function ChatFab({ onPress }: ChatFabProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // Position it higher to clear the bottom navigation tab bar completely
  const bottomPosition = 100 + Math.max(0, insets.bottom);

  // Apply shadow styling directly to the circular elements to prevent square container box shadows
  const shadowStyle = {
    shadowColor: isDark ? "#7174F6" : "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.65 : 0.25,
    shadowRadius: isDark ? 10 : 8,
    elevation: 8,
  };

  return (
    <View style={[styles.container, { bottom: bottomPosition }]} pointerEvents="box-none">
      <Pressable onPress={onPress} className="active:scale-95">
        {isDark ? (
          // Dark Mode: Dual-circle Blue Gradient Orb
          <LinearGradient
            colors={["#5480F1", "#3B60E4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.outerCircle, shadowStyle]}
          >
            <LinearGradient
              colors={["#74A2F7", "#A9C3F3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.innerCircle}
            >
              <Feather name="message-circle" size={26} color="#10111d" />
            </LinearGradient>
          </LinearGradient>
        ) : (
          // Light Mode: Dual-circle Blue-to-Green Gradient Orb
          <LinearGradient
            colors={["#5480F1", "#A1D66C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.outerCircle, shadowStyle]}
          >
            <LinearGradient
              colors={["#74A2F7", "#BCE5ED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.innerCircle}
            >
              <Feather name="message-circle" size={26} color="#FFFFFF" />
            </LinearGradient>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    zIndex: 9999,
  },
  outerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    padding: 3.5, // Creates the outer border ring width
  },
  innerCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
