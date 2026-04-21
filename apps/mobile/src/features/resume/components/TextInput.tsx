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
  style,
  ...props
}: TextInputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <View style={{ marginBottom: 8, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{label}</Text>
          {required && (
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#dc2626", marginLeft: 4 }}>
              *
            </Text>
          )}
        </View>
      )}
      <RNTextInput
        {...props}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        style={[
          {
            height: multiline ? numberOfLines * 40 : 48,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: error ? "#ef4444" : "#d1d5db",
            backgroundColor: "#ffffff",
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            color: "#111827",
          },
          style,
        ]}
        placeholderTextColor="#9CA3AF"
      />
      {error && <Text style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{error}</Text>}
    </View>
  );
}
