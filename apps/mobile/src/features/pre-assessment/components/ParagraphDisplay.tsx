import React from "react";
import { View, Text } from "react-native";

interface ParagraphDisplayProps {
  paragraph: string;
  topic: string;
}

export function ParagraphDisplay({ paragraph, topic }: ParagraphDisplayProps) {
  return (
    <View className="bg-gray-50 p-4 rounded-lg mb-6">
      <Text className="text-sm font-semibold text-gray-600 mb-2">{topic}</Text>
      <Text className="text-base text-gray-800 leading-6">{paragraph}</Text>
    </View>
  );
}
