/**
 * TextInput Component - Reusable Text Input Field
 * With label, error state, and multiline support
 */

import { View, TextInput as RNTextInput, TextInputProps as RNTextInputProps } from "react-native";
import { Text } from "@/components/Themed";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

export function TextInput({
  label,
  error,
  required,
  multiline = false,
  rows = 1,
  className,
  ...props
}: TextInputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-2 text-sm font-semibold text-gray-900">
          {label}
          {required && <Text className="text-red-600"> *</Text>}
        </Text>
      )}
      <RNTextInput
        {...props}
        multiline={multiline}
        numberOfLines={multiline ? rows : 1}
        className={`${
          multiline ? "h-24" : "h-12"
        } rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 ${
          error ? "border-red-500" : ""
        } ${className || ""}`}
        placeholderTextColor="#9CA3AF"
      />
      {error && <Text className="mt-1 text-xs text-red-600">{error}</Text>}
    </View>
  );
}
