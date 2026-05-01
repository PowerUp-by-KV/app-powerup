import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const OPTIONS = ["Daily", "3 - 4 times a week", "Weekly"];

export function FrequencyScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(0);

  const handleContinue = () => {
    // Save frequency if needed
    router.replace("/profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-[360px]">
          <Text className="text-lg font-semibold text-center mb-4">
            Set your learning frequency
          </Text>

          <View className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
            {OPTIONS.map((opt, idx) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setSelected(idx)}
                className={`px-4 py-5 border-b border-slate-100 flex-row items-center ${selected === idx ? "bg-slate-50" : ""}`}
              >
                <View
                  className={`w-4 h-4 rounded-full mr-4 ${selected === idx ? "bg-gray-700" : "bg-gray-400"}`}
                />
                <Text className="text-base text-slate-800">{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="rounded-full py-4 items-center mb-4 bg-gray-700"
            onPress={handleContinue}
          >
            <Text className="text-white font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default FrequencyScreen;
