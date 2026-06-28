import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Text } from "@/components/Themed";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface WizardFooterCTAProps {
  onNext: () => void;
  nextLabel?: string;
  onSkip?: () => void;
  skipLabel?: string;
  isNextDisabled?: boolean;
}

export function WizardFooterCTA({
  onNext,
  nextLabel = "Continue",
  onSkip,
  skipLabel = "Skip",
  isNextDisabled = false,
}: WizardFooterCTAProps) {
  const { isDark } = useThemeToggle();
  return (
    <View style={[styles.footer, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      {onSkip && (
        <Pressable
          onPress={onSkip}
          style={[styles.skipButton, { borderColor: isDark ? "#475569" : "#d1d5db" }]}
        >
          <Text style={[styles.skipButtonText, { color: isDark ? "#94a3b8" : "#6b7280" }]}>
            {skipLabel}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={onNext}
        disabled={isNextDisabled}
        style={[
          styles.nextButton,
          isNextDisabled && styles.nextButtonDisabled,
          !onSkip && { width: "100%" }, // full width if no skip button
        ]}
      >
        <Text style={styles.nextButtonText}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 24, // Safe area bottom padding
    backgroundColor: "#f3f4f6", // Match the light gray background for seamless floating
    borderTopWidth: 0,
    justifyContent: "space-between",
    gap: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30, // Pill shape
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "700",
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30, // Pill shape
    backgroundColor: "#3b82f6", // Vibrant Blue
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
