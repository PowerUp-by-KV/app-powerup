import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { selectCefrLevel } from "@/store/slices/authSlice";
import { useGetModuleDaysQuery } from "@/services/module-api";
import { RefreshCcw, ChevronLeft } from "lucide-react-native";
import { HighFidelityCard } from "@/components/ui/HighFidelityCard";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { Image } from "react-native";

export const CurriculumScreen = () => {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const cefrLevel = useAppSelector(selectCefrLevel);

  const { data: userProfile } = useGetUserProfileQuery("user-1");
  const { user: contextUser } = useUser();

  const userName = userProfile?.name || contextUser?.name || "User";
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;

  const {
    data: daysData,
    isLoading,
    isError,
    refetch,
  } = useGetModuleDaysQuery({
    moduleId: moduleId!,
    cefr_level: cefrLevel,
  });

  const completedDayNos = useAppSelector((state) => state.progress.completedDays[moduleId!] || []);

  const getProcessedDays = () => {
    const rawDays = daysData || [];
    let foundCurrent = false;

    return rawDays.map((day) => {
      const isCompleted = completedDayNos.includes(day.order_index);
      let newStatus = isCompleted ? "completed" : ("locked" as const);

      if (foundCurrent) {
        newStatus = "locked";
      } else if (!isCompleted) {
        foundCurrent = true;
        newStatus = "in_progress";
      }

      return {
        id: day.id,
        day_no: day.order_index,
        title: day.title || `Day ${day.order_index}`,
        tag: day.tag || "Section",
        duration: day.duration || "2h",
        gradient: day.gradient || ["#64748B", "#CBD5E1"],
        status: newStatus,
      };
    });
  };

  const days = getProcessedDays();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#475569" />
        <Text className="mt-4 text-slate-500 font-medium tracking-tight">Loading modules...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-10">
        <Text className="text-xl font-bold text-slate-800 mb-2 text-center">
          Something went wrong while loading the curriculum
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
            onPress={() => router.push("/profile")}
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
              router.push("/(tabs)/my-learning");
            }
          }}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#F1F5F9] items-center justify-center mb-4"
        >
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-[28px] font-extrabold text-[#1E293B]">Curriculum</Text>
        <Text className="text-[#94A3B8] text-[15px] font-bold mt-0.5">Stage Content Breakdown</Text>
      </View>

      <ScrollView className="flex-1 px-12" showsVerticalScrollIndicator={false}>
        {days.map((day) => (
          <HighFidelityCard
            key={day.id}
            title={day.title}
            tag={day.tag}
            duration={day.duration}
            status={day.status as "locked" | "completed" | "in_progress"}
            gradient={day.gradient}
            onPress={() => {
              // subModuleId is the backend id
              const subModuleId = day.id;
              router.push(`/modules/${moduleId}/${subModuleId}`);
            }}
          />
        ))}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};
