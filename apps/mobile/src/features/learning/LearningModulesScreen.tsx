import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LEARNING_MODULES } from "@/constants/mockData";
import { ArrowLeft, Clock } from "lucide-react-native";
import { useAppSelector } from "@/store/hooks";
import { selectTotalTime } from "@/store/slices/timeTrackingSlice";
import { ModuleCard } from "./components/ModuleCard";

export const LearningModulesScreen = () => {
  const totalSeconds = useAppSelector(selectTotalTime);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const handlePress = (item: any) => {
    if (item.id === "grammar") {
      router.push("/grammar");
    } else if (item.id === "reading") {
      router.push({ pathname: "/ReadingPractice", params: { readingId: "r1" } });
    } else if (item.id === "verbal") {
      router.push("/VerbalCategories");
    } else if (item.id === "listening") {
      router.push("/listening");
    } else if (item.id === "behavioural") {
      router.push("/behavioural");
    } else {
      router.push({ pathname: "/topics", params: { moduleId: item.id, moduleTitle: item.title } });
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <View className="p-6 pt-16 bg-white rounded-b-[40px] shadow-sm">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-[#F8F9FA] items-center justify-center mb-4"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-3xl font-extrabold text-black tracking-tight">Learning Modules</Text>
        <View className="flex-row items-center mt-1">
          <Clock size={16} color="#6B7280" />
          <Text className="text-sm text-gray-500 font-bold ml-1">{totalMinutes}m spent today</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between">
          {LEARNING_MODULES.map((module, index) => {
            const mockProgress = [65, 30, 90, 45, 75];
            const progress = mockProgress[index % mockProgress.length] ?? 0;

            return (
              <ModuleCard
                key={module.id}
                moduleId={module.id}
                title={module.id === "verbal" ? "Speaking" : module.title}
                subtitle={module.description}
                icon={module.icon}
                colors={module.gradient}
                progress={progress}
                onPress={() => handlePress(module)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
