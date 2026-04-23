import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const OPTIONS = [
  { id: "casual", title: "Casual", min: "3 mins/day", icon: "coffee" as const },
  { id: "regular", title: "Regular", min: "10 mins/day", icon: "activity" as const },
  { id: "serious", title: "Serious", min: "15 mins/day", icon: "zap" as const },
  { id: "intense", title: "Intense", min: "30 mins/day", icon: "flame" as const },
];

export function FrequencyScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    // Save frequency if needed
    router.replace("/profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12 pb-6">
        <View className="mb-8">
          <Text className="text-3xl font-extrabold text-slate-900 text-center">
            Pick a daily goal
          </Text>
          <Text className="text-base text-slate-500 mt-3 text-center px-4">
            A small pledge goes a long way. You can always change this later.
          </Text>
        </View>

        <ScrollView className="flex-1 mb-6" showsVerticalScrollIndicator={false}>
          <View className="space-y-3">
            {OPTIONS.map((item) => {
              const isSelected = selected === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelected(item.id)}
                  className={`flex-row items-center p-5 mb-3 rounded-2xl border-2 ${
                    isSelected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white"
                  }`}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                      isSelected ? "bg-indigo-600" : "bg-slate-100"
                    }`}
                  >
                    <Feather name={item.icon} size={24} color={isSelected ? "white" : "#64748B"} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-lg font-extrabold ${
                        isSelected ? "text-indigo-900" : "text-slate-800"
                      }`}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <Text
                    className={`text-base font-semibold ${
                      isSelected ? "text-indigo-600" : "text-slate-500"
                    }`}
                  >
                    {item.min}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity
          className={`rounded-full py-4 items-center mb-2 ${
            selected ? "bg-gray-800" : "bg-gray-300"
          }`}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default FrequencyScreen;
