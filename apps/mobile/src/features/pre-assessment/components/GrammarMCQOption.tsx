import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface MCQOptionProps {
  label: string;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function MCQOption({ label: _label, text, isSelected, onSelect }: MCQOptionProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 mb-2 rounded-xl border-2 ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1F2A]"
      }`}
      onPress={onSelect}
    >
      <View
        className={`w-6 h-6 rounded-lg border-2 mr-3 items-center justify-center ${
          isSelected ? "bg-blue-500 border-blue-500" : "border-gray-400"
        }`}
      >
        {isSelected && <Text className="text-white font-bold">✓</Text>}
      </View>
      <Text
        className={`flex-1 text-sm font-semibold leading-relaxed ${isSelected ? "text-gray-800 dark:text-white" : "text-gray-800 dark:text-gray-300"}`}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
