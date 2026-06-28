/**
 * TextInput Component - Reusable Text Input Field
 * With label, error state, and multiline support
 */

import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from "react-native";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  rows?: number;
  className?: string;
}

export function TextInput({
  label,
  error,
  required,
  multiline = false,
  numberOfLines = 1,
  rows,
  className,
  ...props
}: TextInputProps) {
  const resolvedLines = rows ?? numberOfLines;
  const heightClass = multiline
    ? {
        1: "h-12",
        2: "h-20",
        3: "h-[120px]",
        4: "h-40",
      }[resolvedLines] || "h-[120px]"
    : "h-12";

  return (
    <View className="mb-4">
      {label && (
        <View className="mb-2 flex-row items-center">
          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</Text>
          {required && (
            <Text className="ml-1 text-sm font-semibold text-red-600 dark:text-red-400">*</Text>
          )}
        </View>
      )}
      <RNTextInput
        {...props}
        multiline={multiline}
        numberOfLines={multiline ? resolvedLines : 1}
        className={`${heightClass} rounded-2xl border ${
          error ? "border-red-500" : "border-gray-200 dark:border-slate-700"
        } bg-[#f9fafb] dark:bg-slate-800 px-4 py-3.5 text-[15px] text-gray-900 dark:text-gray-100 ${className || ""}`}
        placeholderTextColor="#9CA3AF"
      />
      {!!error && <Text className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</Text>}
    </View>
  );
}
