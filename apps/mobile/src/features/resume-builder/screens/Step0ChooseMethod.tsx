import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface Step0ChooseMethodProps {
  onNext: (method: "upload" | "scratch") => void;
  onBack: () => void;
}

export function Step0ChooseMethod({ onNext, onBack }: Step0ChooseMethodProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();
  const [selectedMethod, setSelectedMethod] = useState<"upload" | "scratch" | null>(null);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: isDark ? "#0f172a" : "#ffffff" },
      ]}
    >
      {/* Background Glow */}
      <View style={[StyleSheet.absoluteFillObject, { overflow: "hidden" }]} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="glow" cx="100%" cy="0%" rx="70%" ry="50%" fx="100%" fy="0%">
              <Stop offset="0%" stopColor={isDark ? "#1e293b" : "#E2E8F4"} stopOpacity="1" />
              <Stop offset="100%" stopColor={isDark ? "#1e293b" : "#E2E8F4"} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100%" cy="0" r={Dimensions.get("window").width * 0.8} fill="url(#glow)" />
        </Svg>
      </View>
      <View style={styles.topBar}>
        <Pressable
          onPress={onBack}
          style={[
            styles.backButton,
            {
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#E5E7EB",
            },
          ]}
        >
          <Feather name="arrow-left" size={20} color={isDark ? "#D1D5DB" : "#9CA3AF"} />
        </Pressable>
      </View>

      {/* Title & Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>
          Ready to Build your Resume?
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
          Just review, edit, and update it with new information
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Upload Card */}
        <Pressable
          onPress={() => setSelectedMethod("upload")}
          style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#E5E7EB",
            },
            selectedMethod === "upload" && [
              styles.cardSelected,
              { backgroundColor: isDark ? "#1e3a8a" : "#F8FAFF" },
            ],
          ]}
        >
          {/* Recommended Badge */}
          <LinearGradient
            colors={["#60A5FA", "#A3E635"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.recommendedBadge}
          >
            <Text style={styles.recommendedText}>Recommended</Text>
          </LinearGradient>

          <View style={[styles.iconCircle, { backgroundColor: isDark ? "#374151" : "#F3F4F6" }]}>
            <Feather name="upload" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </View>
          <Text style={[styles.cardTitle, { color: isDark ? "#F3F4F6" : "#4B5563" }]}>
            Yes, upload my resume
          </Text>
          <Text style={[styles.cardSubtitle, { color: isDark ? "#9CA3AF" : "#9CA3AF" }]}>
            We'll extract and enhance your info
          </Text>
        </Pressable>

        {/* From Scratch Card */}
        <Pressable
          onPress={() => setSelectedMethod("scratch")}
          style={[
            styles.card,
            {
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#E5E7EB",
            },
            selectedMethod === "scratch" && [
              styles.cardSelected,
              { backgroundColor: isDark ? "#1e3a8a" : "#F8FAFF" },
            ],
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "#374151" : "#F3F4F6" }]}>
            <Feather name="file-text" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </View>
          <Text style={[styles.cardTitle, { color: isDark ? "#F3F4F6" : "#4B5563" }]}>
            No, start from scratch
          </Text>
          <Text style={[styles.cardSubtitle, { color: isDark ? "#9CA3AF" : "#9CA3AF" }]}>
            Build step-by-step with AI
          </Text>
        </Pressable>
      </View>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={() => selectedMethod && onNext(selectedMethod)}
          disabled={!selectedMethod}
          style={[styles.continueButton, !selectedMethod && styles.continueButtonDisabled]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginTop: 64,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 24,
    lineHeight: 20,
    textAlign: "center",
  },
  cardsContainer: {
    paddingHorizontal: 24,
    marginTop: 48,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  cardSelected: {
    borderColor: "#5A7CFF",
    backgroundColor: "#F8FAFF",
  },
  recommendedBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#ffffff",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 16,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 6,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  continueButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5A7CFF",
    shadowColor: "#5A7CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
