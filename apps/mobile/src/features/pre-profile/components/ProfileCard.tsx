import React from "react";
import { View, Text } from "react-native";

interface ProfileCardProps {
  name: string;
  mobile: string;
  dob: string;
  college: string;
}

export function ProfileCard({ name, mobile, dob, college }: ProfileCardProps) {
  return (
    <View className="bg-white p-4 rounded-lg shadow-md mb-4">
      <View className="mb-3">
        <Text className="text-gray-600 text-sm">Full Name</Text>
        <Text className="text-gray-900 text-base font-semibold">{name}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-gray-600 text-sm">Mobile Number</Text>
        <Text className="text-gray-900 text-base font-semibold">{mobile}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-gray-600 text-sm">Date of Birth</Text>
        <Text className="text-gray-900 text-base font-semibold">{dob}</Text>
      </View>

      <View>
        <Text className="text-gray-600 text-sm">College</Text>
        <Text className="text-gray-900 text-base font-semibold">{college}</Text>
      </View>
    </View>
  );
}
