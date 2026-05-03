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
  numberOfLines?: number;
}

export function TextInput({
  label,
  error,
  required,
  multiline = false,
  numberOfLines = 1,
  ...props
}: TextInputProps) {
  const heightClass = multiline
    ? {
        1: "h-12",
        2: "h-20",
        3: "h-[120px]",
        4: "h-40",
      }[numberOfLines] || "h-[120px]"
    : "h-12";

  return (
    <View className="mb-4">
      {label && (
        <View className="mb-2 flex-row items-center">
          <Text className="text-sm font-semibold text-gray-900">{label}</Text>
          {required && <Text className="ml-1 text-sm font-semibold text-red-600">*</Text>}
        </View>
      )}
      <RNTextInput
        {...props}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        className={`${heightClass} rounded-lg border ${
          error ? "border-red-500" : "border-gray-300"
        } bg-white px-3 py-2.5 text-sm text-gray-900`}
        placeholderTextColor="#9CA3AF"
      />
      {error && <Text className="mt-1.5 text-xs text-red-600">{error}</Text>}
    </View>
  );
}
