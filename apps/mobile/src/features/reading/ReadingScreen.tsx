import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export const ReadingScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-[60px] flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-[15px]">
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-black">Reading Practice</Text>
      </View>
      <View className="flex-1 justify-center items-center px-5">
        <Text className="text-base text-[#64748B] text-center">
          Welcome to Reading Practice. Select a story to begin.
        </Text>
      </View>
    </SafeAreaView>
  );
};
