/**
 * Button Component - Reusable Primary & Secondary Buttons
 * Enterprise-grade styling with Tailwind CSS
 */

import { Pressable, PressableProps, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { ActivityIndicator } from "react-native";

interface ButtonProps extends PressableProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: string;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: { backgroundColor: "#2563EB" },
    secondary: { backgroundColor: "#e5e7eb" },
    danger: { backgroundColor: "#dc2626" },
  };

  const textColorStyles = {
    primary: "#ffffff",
    secondary: "#111827",
    danger: "#ffffff",
  };

  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={[styles.button, variantStyles[variant], isDisabled && styles.disabled]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColorStyles[variant]} size="small" />
      ) : (
        <Text style={[styles.buttonText, { color: textColorStyles[variant] }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
