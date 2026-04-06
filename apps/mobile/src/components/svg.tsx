import React from "react";
import { View, Text } from "react-native";

export function GoogleLogo({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return (
    <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#4285F4", fontSize: Math.max(12, width / 1.5), fontWeight: "bold" }}>
        G
      </Text>
    </View>
  );
}
