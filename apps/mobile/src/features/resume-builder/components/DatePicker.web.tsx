import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Themed";

interface DatePickerProps {
  label: string;
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export function DatePicker({ label, value, onChange, required, error }: DatePickerProps) {
  return (
    <View className="mb-4">
      {label && (
        <View className="mb-2 flex-row items-center">
          <Text className="text-sm font-semibold text-gray-900">{label}</Text>
          {required && <Text className="ml-1 text-sm font-semibold text-red-600">*</Text>}
        </View>
      )}
      <input
        type="date"
        value={value || ""}
        max={new Date().toISOString().split("T")[0]}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 48,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: error ? "#EF4444" : "#D1D5DB",
          backgroundColor: "white",
          paddingLeft: 12,
          paddingRight: 12,
          fontSize: 14,
          color: "#111827",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />
      {!!error && <Text className="mt-1.5 text-xs text-red-600">{error}</Text>}
    </View>
  );
}
