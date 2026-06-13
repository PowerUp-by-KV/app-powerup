/**
 * Button Component - Reusable Primary & Secondary Buttons
 * Enterprise-grade styling with Tailwind CSS
 */

import { ActivityIndicator, Pressable, PressableProps, View, Text } from "react-native";

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
    primary: "bg-blue-600 active:bg-blue-700",
    secondary: "bg-gray-200 active:bg-gray-300",
    danger: "bg-red-600 active:bg-red-700",
  };

  const sizeStyles = {
    sm: "px-4 py-2 rounded-lg",
    md: "px-6 py-3 rounded-xl",
    lg: "px-8 py-4 rounded-xl",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const textColorStyles = {
    primary: "text-white",
    secondary: "text-gray-900",
    danger: "text-white",
  };

  const indicatorColors = {
    primary: "#ffffff",
    secondary: "#111827",
    danger: "#ffffff",
  };

  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${
        isDisabled ? "opacity-50" : ""
      } flex-row items-center justify-center`}
    >
      {isLoading && (
        <View className="mr-2">
          <ActivityIndicator color={indicatorColors[variant]} size="small" />
        </View>
      )}
      <Text className={`font-semibold ${textColorStyles[variant]} ${textSizeStyles[size]}`}>
        {children}
      </Text>
    </Pressable>
  );
}
