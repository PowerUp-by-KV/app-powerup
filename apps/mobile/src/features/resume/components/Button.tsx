/**
 * Button Component - Reusable Primary & Secondary Buttons
 * Enterprise-grade styling with Tailwind CSS
 */

import { ActivityIndicator, Pressable, PressableProps } from "react-native";
import { Text } from "@/components/Themed";

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
  const variantClasses = {
    primary: "bg-blue-600",
    secondary: "bg-gray-200",
    danger: "bg-red-600",
  };

  const textColorClasses = {
    primary: "text-white",
    secondary: "text-gray-900",
    danger: "text-white",
  };

  const indicatorColors = {
    primary: "#ffffff",
    secondary: "#111827",
    danger: "#ffffff",
  };

  const sizeClasses = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-5 py-3.5",
  };

  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-lg ${sizeClasses[size]} ${
        variantClasses[variant]
      } ${isDisabled ? "opacity-50" : ""}`}
    >
      {isLoading ? (
        <ActivityIndicator color={indicatorColors[variant]} size="small" />
      ) : (
        <Text className={`text-sm font-semibold ${textColorClasses[variant]}`}>{children}</Text>
      )}
    </Pressable>
  );
}
