import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";

interface MCQOptionProps {
  label: string;
  text: string;
  isSelected: boolean;
  isCorrect: boolean | null;
  isWrong: boolean | null;
  onPress: () => void;
  disabled: boolean;
}

/**
 * Standardized MCQ Option component with (A, B, C, D) labels.
 * Provides unified styling for selection, correct, and incorrect states.
 */
const MCQOption = ({
  label,
  text,
  isSelected,
  isCorrect,
  isWrong,
  onPress,
  disabled,
}: MCQOptionProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.optionButton,
        isSelected && styles.selectedOption,
        isCorrect && styles.correctOption,
        isWrong && styles.wrongOption,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.optionIndex,
          isSelected && styles.selectedOptionIndex,
          isCorrect && styles.correctOptionIndex,
          isWrong && styles.wrongOptionIndex,
        ]}
      >
        <Text
          style={[
            styles.optionIndexText,
            (isSelected || isCorrect || isWrong) && styles.selectedOptionIndexText,
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.optionText,
          isSelected && styles.selectedOptionText,
          isCorrect && styles.correctOptionText,
          isWrong && styles.wrongOptionText,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E2E8F0", // slate-200
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  correctOption: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "10",
  },
  wrongOption: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "10",
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9", // slate-100
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  selectedOptionIndex: {
    backgroundColor: COLORS.primary,
  },
  correctOptionIndex: {
    backgroundColor: COLORS.success,
  },
  wrongOptionIndex: {
    backgroundColor: COLORS.error,
  },
  optionIndexText: {
    fontSize: 14,
    color: "#475569", // slate-600
    ...FONTS.bold,
  },
  selectedOptionIndexText: {
    color: COLORS.white,
  },
  optionText: {
    fontSize: 16,
    color: "#1E293B", // slate-800
    flex: 1,
    ...FONTS.medium,
  },
  selectedOptionText: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
  correctOptionText: {
    color: COLORS.success,
    ...FONTS.bold,
  },
  wrongOptionText: {
    color: COLORS.error,
    ...FONTS.bold,
  },
});

export default MCQOption;
