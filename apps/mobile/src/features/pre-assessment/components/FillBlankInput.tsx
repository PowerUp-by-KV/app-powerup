import React from "react";
import { View, Text, TextInput } from "react-native";

interface FillBlankInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export function FillBlankInput({ value, onChange, placeholder }: FillBlankInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
        Your Answer:
      </Text>
      <TextInput
        className="border-2 border-blue-400 dark:border-blue-500 rounded-lg px-4 py-3 text-base text-gray-800 dark:text-white"
        placeholder={placeholder || "Type your answer here..."}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChange}
        multiline
      />
    </View>
  );
}
