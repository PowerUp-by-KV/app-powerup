import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface AuthSuccessScreenProps {
  title: string;
  subtitle: string;
  cta: string;
  onCta: () => void;
}

export function AuthSuccessScreen({ title, subtitle, cta, onCta }: AuthSuccessScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-slate-900 items-center justify-center mb-6">
          <Feather name="check" size={28} color="#fff" />
        </View>
        <Text className="text-slate-900 text-3xl font-extrabold mb-3 text-center">{title}</Text>
        <Text className="text-slate-500 text-base text-center mb-12">{subtitle}</Text>
        <Pressable
          onPress={onCta}
          className="bg-slate-700 rounded-full py-4 items-center w-full active:opacity-85"
        >
          <Text className="text-white font-bold text-base">{cta}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
