import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { CefrResultView } from "@/features/modules/components/CefrResultView";

export default function AssessmentResultScreen() {
  const { moduleId } = useLocalSearchParams();

  // Mock data matching the requested design
  const mockData = {
    overallScore: 5.0,
    totalScore: 100,
    maxScore: 6,
    maxTotalPoints: 120,
    cefrLevel: "C1",
    readingScore: 5.0,
    listeningScore: 5.0,
    writingScore: 4.0,
    speakingScore: 6.0,
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View className="flex-row items-center px-6 pt-14 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#F1F5F9] items-center justify-center mr-4"
        >
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-[#1E293B]">Results</Text>
      </View>

      <View className="flex-1" style={{ width: "100%", alignSelf: "center" }}>
        <CefrResultView {...mockData} />

        <View className="px-6 flex-1 justify-end pb-8">
          <TouchableOpacity
            className="bg-[#475569] w-full py-3.5 rounded-[18px] items-center shadow-lg"
            onPress={() => router.replace("/(tabs)/my-learning")}
          >
            <Text className="text-white text-[16px] font-bold">Back to Learning</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
