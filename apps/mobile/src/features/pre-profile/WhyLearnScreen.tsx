import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";

const OPTIONS = [
  "Improve career",
  "Travel",
  "Study abroad",
  "Speak with friends",
  "Pass exams",
  "Hobby",
  "Other",
];

export function WhyLearnScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  const handleContinue = () => {
    // Save selection if needed
    router.push("/pre-profile-frequency");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-[360px]">
          <Text className="text-lg font-semibold text-center mb-4">
            Why do you want to learn English?
          </Text>

          <FlatList
            data={OPTIONS}
            keyExtractor={(item) => item}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6"
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setSelected(index)}
                className={`px-4 py-5 border-b border-slate-100 flex-row items-center ${selected === index ? "bg-slate-50" : ""}`}
              >
                <View
                  className={`w-4 h-4 rounded-full mr-4 ${selected === index ? "bg-gray-700" : "bg-gray-400"}`}
                />
                <Text className="text-base text-slate-800">{item}</Text>
              </TouchableOpacity>
            )}
          />

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

export default WhyLearnScreen;
