import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface MCQOptionProps {
  label: string;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function MCQOption({ label, text, isSelected, onSelect }: MCQOptionProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 mb-2 rounded-xl border-2 ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
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
      <Text className="flex-1 text-gray-800 text-sm font-semibold leading-relaxed">{text}</Text>
    </TouchableOpacity>
  );
}
