import React from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, CheckCircle, AlertTriangle } from "lucide-react-native";
import { useProgress } from "./hooks/ProgressContext";
import { ProgressBar } from "@/features/progress/components";

const HeatmapSection = ({ title, items, color, icon }: any) => (
  <View className="mb-[25px]">
    <View className="flex-row items-center mb-3">
      <Text className="text-lg text-black font-bold mr-2">{title}</Text>
      {icon}
    </View>
    <View className="bg-white rounded-[20px] p-5 shadow-sm shadow-black/10 elevation-5">
      {items.map((item: any, index: number) => (
        <View key={index} className="mb-[15px]">
          <View className="flex-row justify-between mb-2">
            <Text className="text-base text-black font-medium">{item.name}</Text>
            <Text className="text-sm text-[#64748B] font-bold">{item.percentage}%</Text>
          </View>
          <ProgressBar progress={item.percentage} color={color} className="h-2 rounded-full" />
        </View>
      ))}
    </View>
  </View>
);

export const StrengthWeaknessHeatmap = () => {
  const { heatmap } = useProgress();

  // Mock data if null
  const displayHeatmap = heatmap || {
    strongAreas: [
      { name: "Present Tense", percentage: 92 },
      { name: "Basic Vocabulary", percentage: 85 },
      { name: "Simple Sentences", percentage: 82 },
    ],
    needsImprovement: [
      { name: "Prepositions", percentage: 45 },
      { name: "Pronunciation: θ", percentage: 42 },
      { name: "Past Perfect", percentage: 38 },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="flex-row items-center justify-between px-5 py-[15px] pt-[60px] bg-white rounded-b-[30px] shadow-sm shadow-black/5 elevation-2 mb-2.5">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-[#F8F9FA] justify-center items-center"
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black text-center">Strengths & Weaknesses</Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <HeatmapSection
          title="Strong Areas"
          items={displayHeatmap.strongAreas}
          color="#22C55E"
          icon={<CheckCircle size={18} color="#22C55E" />}
        />

        <HeatmapSection
          title="Needs Improvement"
          items={displayHeatmap.needsImprovement}
          color="#F59E0B"
          icon={<AlertTriangle size={18} color="#F59E0B" />}
        />

        <TouchableOpacity
          className="bg-[#6366F1] py-4 rounded-[15px] items-center mt-2.5 shadow-lg shadow-[#6366F1]/30"
          onPress={() => router.push("/LearningModules")}
        >
          <Text className="text-white text-base font-bold">Practice Weak Areas</Text>
        </TouchableOpacity>

        <View className="h-[50px]" />
      </ScrollView>
    </SafeAreaView>
  );
};
