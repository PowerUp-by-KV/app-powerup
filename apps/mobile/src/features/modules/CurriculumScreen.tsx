import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { selectUserId, selectCefrLevel } from "@/store/slices/authSlice";
import { useGetModulesQuery } from "@/services/module-api";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { RefreshCcw, ChevronLeft } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { ModuleTimelineItem } from "./components/ModuleTimelineItem";

const TOTAL_SUB_MODULES = 12;

export const CurriculumScreen = () => {
  const userId = useAppSelector(selectUserId);
  const cefrLevel = useAppSelector(selectCefrLevel);

  const { data: userProfile } = useGetUserProfileQuery(userId || "user-1");
  const { user: contextUser } = useUser();
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;

  const {
    data: rawModules,
    isLoading,
    isError,
    refetch,
  } = useGetModulesQuery({ user_id: userId, cefr_level: cefrLevel });

  const allStageProgress = useAppSelector((state) => state.progress.completedDays);

  const getProcessedModules = () => {
    if (!rawModules) return [];

    const processed = rawModules.map((module) => {
      // Calculate how many sub-modules are done in this stage
      const subModulesDone = allStageProgress[module.id]?.length || 0;
      const totalSubModules = TOTAL_SUB_MODULES; // Assuming 12 days per module for now

      return {
        module_id: module.id,
        module_no: module.order_index,
        name: module.title,
        subtitle: module.description || `Module ${module.order_index}`, // Use description if available
        status: "locked" as "completed" | "in_progress" | "locked",
        lessonsCompleted: subModulesDone,
        totalLessons: totalSubModules,
        xpEarned: subModulesDone * 30,
      };
    });

    // Determine completion status sequentially
    let foundCurrent = false;
    return processed.map((module) => {
      // If we don't have enough data, just mark first as in progress
      // Alternatively, check subModulesDone >= totalSubModules
      const isCompleted = module.lessonsCompleted >= module.totalLessons && module.totalLessons > 0;

      if (foundCurrent) {
        return { ...module, status: "locked" as const };
      }
      if (!isCompleted) {
        foundCurrent = true;
        return { ...module, status: "in_progress" as const };
      }
      return { ...module, status: "completed" as const };
    });
  };

  const modules = getProcessedModules();

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8FAFC] justify-center items-center">
        <ActivityIndicator size="large" color="#475569" />
        <Text className="mt-4 text-slate-500 font-medium tracking-tight">
          Loading curriculum...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-[#F8FAFC] justify-center items-center px-10">
        <Text className="text-xl font-bold text-slate-800 mb-4 text-center">
          Something went wrong while loading your curriculum
        </Text>
        <TouchableOpacity
          className="bg-[#475569] px-8 py-3 rounded-full flex-row items-center"
          onPress={() => refetch()}
        >
          <RefreshCcw size={18} color="white" className="mr-2" />
          <Text className="text-white font-bold text-base">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header Section */}
      <View className="flex-row justify-between items-center px-6 pt-14 pb-4">
        <View>
          <Text className="text-[22px] text-[#1E293B] font-bold">Curriculum</Text>
          <Text className="text-[14px] text-[#94A3B8] font-medium">Your learning path</Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-[#F1F5F9] justify-center items-center shadow-sm border border-[#475569]/10"
          onPress={() => router.push("/(tabs)/profile")}
        >
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} className="w-full h-full rounded-full" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <View className="w-5 h-5 rounded-full border border-[#475569] mb-0.5" />
              <View className="w-7 h-3 rounded-t-full bg-[#94A3B8]" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-2">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/(tabs)/my-learning");
            }
          }}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#F1F5F9] items-center justify-center mb-4"
        >
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Card className="p-4 mb-6 rounded-[24px] shadow-sm bg-white border border-[#F1F5F9]">
          {modules.map((module, index) => (
            <ModuleTimelineItem
              key={module.module_id}
              title={module.name}
              subtitle={module.subtitle}
              status={module.status}
              lessonsCompleted={module.lessonsCompleted}
              totalLessons={module.totalLessons}
              xpEarned={module.xpEarned}
              isLast={index === modules.length - 1}
              onPress={() => {
                router.push(`/(tabs)/my-learning/modules/${module.module_id}`);
              }}
            />
          ))}
        </Card>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};
