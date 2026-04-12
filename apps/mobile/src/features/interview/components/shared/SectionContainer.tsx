import React from "react";
import { View, ViewProps } from "react-native";

interface SectionContainerProps extends ViewProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export function SectionContainer({
  children,
  maxWidth = "md",
  style,
  ...props
}: SectionContainerProps) {
  const maxWidthClass =
    maxWidth === "sm"
      ? "max-w-sm"
      : maxWidth === "lg"
        ? "max-w-lg"
        : "max-w-md";

  return (
    <View {...props} className={`w-full ${maxWidthClass} mx-auto`} style={style}>
      {children}
    </View>
  );
}
