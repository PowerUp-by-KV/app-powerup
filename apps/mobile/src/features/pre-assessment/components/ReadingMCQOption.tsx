import React from "react";
import { Pressable, View, Text } from "react-native";

interface MCQOptionProps {
  label: string;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function MCQOption({ label, text, isSelected, onSelect }: MCQOptionProps) {
  return (
    <Pressable onPress={onSelect} className="mb-3">
      <View
        className={`flex-row items-center p-4 rounded-xl border-2 ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
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
          <Text className="text-gray-800 text-sm font-semibold leading-relaxed">{text}</Text>
        </View>
      </View>
    </Pressable>
  );
}
