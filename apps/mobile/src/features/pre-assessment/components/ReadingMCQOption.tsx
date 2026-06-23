import React from "react";
import { Pressable, View, Text } from "react-native";

interface MCQOptionProps {
  label: string;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function MCQOption({ label: _label, text, isSelected, onSelect, disabled }: MCQOptionProps) {
  return (
    <Pressable
      onPress={onSelect}
      disabled={disabled}
      className={`mb-3 ${disabled ? "opacity-50" : ""}`}
    >
      <View
        className={`flex-row items-center p-4 rounded-xl border-2 ${
          isSelected
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E1F2A]"
        }`}
      >
        <View
          className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
            isSelected ? "border-blue-500 bg-blue-500" : "border-gray-400 bg-white"
          }`}
        >
          {isSelected && <View className="w-2 h-2 bg-white rounded-full" />}
        </View>
        <View className="flex-1">
          <Text
            className={`text-sm font-semibold leading-relaxed ${isSelected ? "text-gray-800 dark:text-white" : "text-gray-800 dark:text-gray-300"}`}
          >
            {text}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
