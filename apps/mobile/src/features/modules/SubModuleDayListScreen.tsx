import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { selectCefrLevel } from "@/store/slices/authSlice";
import { useGetDayActivitiesQuery } from "@/services/lesson-api";
import { RefreshCcw, ChevronLeft } from "lucide-react-native";
import { HighFidelityCard } from "@/components/ui/HighFidelityCard";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { Image } from "react-native";

export const SubModuleDayListScreen = () => {
  const { moduleId, subModuleId } = useLocalSearchParams<{
    moduleId: string;
    subModuleId: string;
  }>();
  const cefrLevel = useAppSelector(selectCefrLevel);
  const { data: userProfile } = useGetUserProfileQuery("00000000-0000-0000-0000-000000000001");
  const { user: contextUser } = useUser();

  const userName = userProfile?.name || contextUser?.name || "User";
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;

  const {
    data: rawActivities,
    isLoading,
    isError,
    refetch,
  } = useGetDayActivitiesQuery(subModuleId!);

  const getDayMetadata = (no: number) => {
    const gradients = [
      ["#475569", "#64748B"],
      ["#334155", "#475569"],
      ["#1E293B", "#334155"],
      ["#64748B", "#94A3B8"],
    ];
    return {
      tag: "Practice",
      duration: "45m",
      gradient: gradients[no % gradients.length],
    };
  };

  const getProcessedActivities = () => {
    if (!rawActivities) return [];

    return rawActivities.map((activity) => {
      const meta = getDayMetadata(activity.order_index || 0);

      let status: "completed" | "in_progress" | "locked" = "locked";
      if (activity.status === "completed") status = "completed";
      else if (activity.status === "in_progress" || activity.status === "not_started") {
        // For now, let's keep it simple. If it's the first non-completed one, it's in_progress.
        status = "in_progress";
      }

      return {
        id: activity.id,
        type: activity.skill_type as any,
        title: activity.skill_type
          ? activity.skill_type.charAt(0).toUpperCase() + activity.skill_type.slice(1)
          : "Practice",
        tag: activity.activity_type
          ? activity.activity_type.replace("_", " ").toUpperCase()
          : "ACTIVITY",
        duration: "15m", // Mock duration per activity
        gradient: meta.gradient,
        status: status,
      };
    });
  };

  const activities = getProcessedActivities();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#475569" />
        <Text className="mt-4 text-slate-500 font-medium tracking-tight">Loading days...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-10">
        <Text className="text-xl font-bold text-slate-800 mb-2">Error</Text>
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
    <View className="flex-1 bg-[#F8F9FA]">
      <View className="px-8 pt-10 pb-6">
        {/* User Header Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-[20px] text-[#1E293B] font-bold">
              Hi, {userName.split(" ")[0]}!
            </Text>
            <Text className="text-[12px] text-[#94A3B8] font-medium leading-tight">
              Ready to learn?
            </Text>
          </View>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-[#E2E8F0]"
            onPress={() => router.push("/(tabs)/profile")}
          >
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} className="w-full h-full rounded-full" />
            ) : (
              <View className="w-[85%] h-[85%] rounded-full bg-[#F1F5F9] items-center justify-center overflow-hidden">
                <View className="w-3 h-3 rounded-full border-2 border-[#475569] mb-0.5" />
                <View className="w-6 h-6 rounded-full bg-[#94A3B8] absolute -bottom-4" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push({
                pathname: "/(tabs)/my-learning/modules/[moduleId]",
                params: { moduleId },
              });
            }
          }}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#F1F5F9] items-center justify-center mb-4"
        >
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text className="text-[28px] font-extrabold text-[#1E293B]">Daily Practice</Text>
        <Text className="text-[#94A3B8] text-[15px] font-bold mt-0.5">12-Day Mastery Cycle</Text>
      </View>

      <ScrollView className="flex-1 px-12" showsVerticalScrollIndicator={false}>
        {activities.map((activity) => (
          <HighFidelityCard
            key={activity.id}
            title={activity.title}
            tag={activity.tag}
            duration={activity.duration}
            status={activity.status}
            gradient={activity.gradient as unknown as readonly [string, string, ...string[]]}
            onPress={() => {
              router.push({
                pathname: "/(tabs)/my-learning/lesson/[moduleId]/[dayNo]",
                params: {
                  moduleId: subModuleId,
                  dayNo: "1", // This is now redundant but kept for route compatibility
                  cefr_level: cefrLevel,
                  stageId: moduleId,
                },
              });
            }}
          />
        ))}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};
