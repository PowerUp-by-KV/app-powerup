import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

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
export const MCQOption = ({
  label,
  text,
  isSelected,
  isCorrect,
  isWrong,
  onPress,
  disabled,
}: MCQOptionProps) => {
  let borderColor = "border-[#E2E8F0]"; // slate-200
  let bgColor = "bg-white";
  let indexBg = "bg-[#F1F5F9]"; // slate-100
  let indexTextColor = "text-[#475569]"; // slate-600
  let textColor = "text-[#1E293B]"; // slate-800

  if (isSelected) {
    borderColor = "border-[#6366F1]"; // primary
    bgColor = "bg-[#6366F1]/10";
    indexBg = "bg-[#6366F1]";
    indexTextColor = "text-white";
    textColor = "text-[#6366F1]";
  }

  if (isCorrect) {
    borderColor = "border-[#22C55E]"; // success
    bgColor = "bg-[#22C55E]/10";
    indexBg = "bg-[#22C55E]";
    indexTextColor = "text-white";
    textColor = "text-[#22C55E]";
  }

  if (isWrong) {
    borderColor = "border-[#EF4444]"; // error
    bgColor = "bg-[#EF4444]/10";
    indexBg = "bg-[#EF4444]";
    indexTextColor = "text-white";
    textColor = "text-[#EF4444]";
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`flex-row items-center p-[15px] rounded-[18px] border-2 mb-3 ${borderColor} ${bgColor}`}
      onPress={onPress}
      disabled={disabled}
    >
      <View className={`w-8 h-8 rounded-full justify-center items-center mr-[15px] ${indexBg}`}>
        <Text className={`text-sm font-bold ${indexTextColor}`}>{label}</Text>
      </View>
      <Text className={`text-base font-medium flex-1 ${textColor}`}>{text}</Text>
    </TouchableOpacity>
  );
};
