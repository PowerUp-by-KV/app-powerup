/**
 * Section Component - Card/Section Wrapper
 * Professional card container with shadow and padding
 */

import { View, ViewProps } from "react-native";
import { Text } from "@/components/Themed";

interface SectionProps extends ViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Section({ title, subtitle, children, className, ...props }: SectionProps) {
  return (
    <View {...props} className={`mb-6 rounded-xl bg-white px-6 py-4 shadow-sm ${className || ""}`}>
      {title && (
        <View className="mb-3">
          <Text className="text-lg font-bold text-gray-900">{title}</Text>
          {subtitle && <Text className="mt-1 text-sm text-gray-600">{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}
