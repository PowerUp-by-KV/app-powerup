import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const OPTIONS = [
  { id: "career", label: "Improve career", icon: "briefcase" as const },
  { id: "travel", label: "Travel & explore", icon: "map" as const },
  { id: "study", label: "Study abroad", icon: "book-open" as const },
  { id: "friends", label: "Speak with friends", icon: "users" as const },
  { id: "exams", label: "Pass exams", icon: "award" as const },
  { id: "hobby", label: "Just a hobby", icon: "heart" as const },
  { id: "other", label: "Other", icon: "more-horizontal" as const },
];

export function WhyLearnScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    // Save selection if needed
    router.push("/pre-profile-frequency");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12 pb-6">
        <View className="mb-8">
          <Text className="text-3xl font-extrabold text-slate-900 text-center">
            Why are you learning?
          </Text>
          <Text className="text-base text-slate-500 mt-3 text-center px-4">
            Tell us your main goal so we can personalize your learning path
          </Text>
        </View>

        <FlatList
          data={OPTIONS}
          keyExtractor={(item) => item.id}
          className="flex-1 mb-6"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selected === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelected(item.id)}
                className={`flex-row items-center p-4 mb-3 rounded-2xl border-2 ${
                  isSelected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white"
                }`}
                activeOpacity={0.7}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                    isSelected ? "bg-indigo-600" : "bg-slate-100"
                  }`}
                >
                  <Feather name={item.icon} size={20} color={isSelected ? "white" : "#64748B"} />
                </View>
                <Text
                  className={`flex-1 text-lg font-semibold ${
                    isSelected ? "text-indigo-900" : "text-slate-700"
                  }`}
                >
                  {item.label}
                </Text>
                {isSelected && <Feather name="check-circle" size={24} color="#4F46E5" />}
              </TouchableOpacity>
            );
          }}
        />

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

export default WhyLearnScreen;
