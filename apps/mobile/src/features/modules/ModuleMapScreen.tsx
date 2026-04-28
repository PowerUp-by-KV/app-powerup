import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { selectUserId, selectCefrLevel } from "@/store/slices/authSlice";
import { useGetModulesQuery } from "@/services/module-api";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { RefreshCcw } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { ModuleTimelineItem } from "./components/ModuleTimelineItem";

export const ModuleMapScreen = () => {
  const userId = useAppSelector(selectUserId);
  const cefrLevel = useAppSelector(selectCefrLevel);

  const { data: userProfile } = useGetUserProfileQuery(userId || "user-1");
  const { user: contextUser } = useUser();
  const userName = userProfile?.name || contextUser?.name || "Explorer";
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;

  const { isLoading, isError, refetch } = useGetModulesQuery({
    user_id: userId,
    cefr_level: cefrLevel,
  });

  const getModuleMetadata = (no: number) => {
    const metadataMap: Record<number, { name: string; subtitle: string }> = {
      1: { name: "Pre Assesment", subtitle: "Master the fundamentals" },
      2: { name: "CEFR Score", subtitle: "Challenge yourself" },
      3: { name: "Post Assesment", subtitle: "Craft effective messages" },
      4: { name: "Resume option", subtitle: "Optimize your Resume" },
    };
    return metadataMap[no] || { name: `Stage ${no}`, subtitle: "Continue your journey" };
  };

  const completedStageNos = useAppSelector(
    (state) => state.progress.completedDays["global-journey"] || [],
  );
  const allStageProgress = useAppSelector((state) => state.progress.completedDays);

  const getProcessedModules = () => {
    const totalModuleCount = 4;
    const processed = new Array(totalModuleCount).fill(null).map((_, index) => {
      const moduleNo = index + 1;
      const moduleId = `m${moduleNo}`;
      const isCompleted = completedStageNos.includes(moduleNo);
      const meta = getModuleMetadata(moduleNo);

      // Calculate how many sub-modules are done in this stage
      const subModulesDone = allStageProgress[moduleId]?.length || 0;
      const totalSubModules = 12;

      return {
        module_id: moduleId,
        module_no: moduleNo,
        name: meta.name,
        subtitle: meta.subtitle,
        status: (isCompleted ? "completed" : "locked") as "completed" | "in_progress" | "locked",
        lessonsCompleted: subModulesDone,
        totalLessons: totalSubModules,
        xpEarned: subModulesDone * 30, // Mock XP calculation
      };
    });

    let foundCurrent = false;
    return processed.map((module) => {
      if (foundCurrent) {
        return { ...module, status: "locked" as const };
      }
      if (module.status !== "completed") {
        foundCurrent = true;
        return { ...module, status: "in_progress" as const };
      }
      return module;
    });
  };

  const modules = getProcessedModules();

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8FAFC] justify-center items-center">
        <ActivityIndicator size="large" color="#475569" />
        <Text className="mt-4 text-slate-500 font-medium tracking-tight">
          Loading your journey...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-[#F8FAFC] justify-center items-center px-10">
        <Text className="text-xl font-bold text-slate-800 mb-4 text-center">
          Something went wrong while loading your path
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
          <Text className="text-[22px] text-[#1E293B] font-bold">
            Hi, {userName.split(" ")[0]}!
          </Text>
          <Text className="text-[14px] text-[#94A3B8] font-medium">
            Ready to learn something new?
          </Text>
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

      <View className="px-6 pb-4">
        <Text className="text-[26px] font-extrabold text-[#1E293B]">My Learning</Text>
        <Text className="text-[#94A3B8] text-[14px] font-bold mt-0.5">
          Track where you&apos;re headed
        </Text>
      </View>

      <View className="flex-1 px-4">
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
                if (module.name === "Pre Assesment") {
                  router.push({
                    pathname: "/(tabs)/my-learning/modules/assessment-result",
                    params: { moduleId: module.module_id },
                  });
                } else {
                  router.push(`/(tabs)/my-learning/modules/${module.module_id}`);
                }
              }}
            />
          ))}
        </Card>
      </View>
    </View>
  );
};
