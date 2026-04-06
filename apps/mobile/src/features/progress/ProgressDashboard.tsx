import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { StreakIndicators, CEFRLevelBar, ModuleProgressCard } from "./components";
import { useProgress } from "./hooks/ProgressContext";

export const ProgressDashboard = () => {
  const { summary, isLoading, refetchAll } = useProgress();

  // Use mock data if API fails or is empty
  const displaySummary = summary || {
    streak: 7,
    overallPercentage: 68,
    cefrLevel: "B1",
    modules: [
      { name: "grammar", percentage: 80, status: "Mastery" },
      { name: "Pronunciation", percentage: 50, status: "In Progress" },
      { name: "Behavioral", percentage: 100, status: "Done" },
      { name: "Vocabulary", percentage: 30, status: "In Progress" },
    ],
  };

  return (
    <View style={{ flex: 1, height: "100%" }} className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetchAll} />}
      >
        <Text className="text-2xl font-bold text-black mb-5">Your Progress</Text>

        <View className="bg-white p-5 rounded-[20px] mb-5 shadow-sm shadow-black/10 elevation-5">
          <StreakIndicators days={displaySummary.streak} />
          <View className="h-10 bg-[#CBD5E1]/50 rounded-xl overflow-hidden justify-center mt-2.5 relative">
            <View
              className="absolute inset-0 bg-[#6366F1]/30 border-r-4 border-[#6366F1]"
              style={{ width: `${displaySummary.overallPercentage}%` }}
            />
            <Text className="text-base font-bold text-[#475569] text-center z-10">
              {displaySummary.overallPercentage}% Complete
            </Text>
          </View>
        </View>

        <CEFRLevelBar currentLevel={displaySummary.cefrLevel} />

        <View className="flex-row justify-between items-center mt-2.5 mb-[15px]">
          <Text className="text-xl font-bold text-black">Module Progress</Text>
          <TouchableOpacity onPress={() => router.push("/progress/trends")}>
            <Text className="text-sm color-[#6366F1] font-medium">View Trends</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {displaySummary.modules.map((module, index) => (
            <ModuleProgressCard
              key={index}
              name={module.name}
              percentage={module.percentage}
              status={module.status}
            />
          ))}
        </View>

        <TouchableOpacity
          className="bg-white border border-[#6366F1] py-[15px] rounded-[15px] items-center mt-2.5"
          onPress={() => router.push("/progress/heatmap")}
        >
          <Text className="text-[#6366F1] text-base font-bold">View Detailed Analysis</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
