import React from "react";
import { Pressable, Text, View } from "react-native";

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: string;
  backgroundColor: string;
  onPress: () => void;
}

export function FeatureCard({ title, subtitle, icon, backgroundColor, onPress }: FeatureCardProps) {
  return (
    <Pressable onPress={onPress} className="active:scale-95 mb-4 rounded-3xl overflow-hidden">
      <View style={{ backgroundColor, padding: 22, minHeight: 130 }}>
        <View className="flex-row items-center mb-3">
          <Text className="text-3xl mr-3">{icon}</Text>
          <Text className="text-white text-xl font-extrabold">{title}</Text>
        </View>
        <Text className="text-white/80 text-sm leading-5">{subtitle}</Text>
      </View>
    </Pressable>
  );
}
