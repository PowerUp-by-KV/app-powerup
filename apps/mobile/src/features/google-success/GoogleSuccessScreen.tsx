import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export function GoogleSuccessScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-8">
      <Image
        source={{
          uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5qRo3DHpnxAUtNwv7575TUVhUZKHqtElokQ&s",
        }}
        className="w-[220px] h-[80px] mb-5"
        resizeMode="contain"
      />

      <Text className="text-gray-400 text-sm mb-8 text-center">
        Digital Transformation & IT Solutions
      </Text>

      <Text className="text-2xl text-white font-bold mb-2">You are all set! 🎉</Text>

      <Text className="text-base text-gray-300 text-center mb-10">
        Your Google login was successful. Continue to create your profile.
      </Text>

      <TouchableOpacity
        className="bg-indigo-600 py-3 px-10 rounded-full"
        onPress={() => router.replace("/profile")}
      >
        <Text className="text-white text-base font-bold">Create Profile →</Text>
      </TouchableOpacity>
    </View>
  );
}
