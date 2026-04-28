import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { selectUserId } from "@/store/slices/authSlice";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { Card } from "@/components/ui/Card";
import { ModuleTimelineItem } from "./components/ModuleTimelineItem";

export const ModuleMapScreen = () => {
  const userId = useAppSelector(selectUserId);

  const { data: userProfile } = useGetUserProfileQuery(userId || "user-1");
  const { user: contextUser } = useUser();
  const userName = userProfile?.name || contextUser?.name || "Explorer";
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;

  // Static UI-only modules data matching the screenshot
  const STATIC_MODULES = [
    {
      module_id: "pre-assessment",
      module_no: 0,
      name: "Pre Assesment",
      description: "Master the fundamentals",
      total_days: 8,
      lessonsCompleted: 8,
      xpEarned: 350,
    },
    {
      module_id: "cefr-score",
      module_no: 1,
      name: "CEFR Score",
      description: "Challenge yourself",
      total_days: 7, // To get ~70% with 5 lessons (5/7 = 71%)
      lessonsCompleted: 5,
      xpEarned: 210,
    },
    {
      module_id: "post-assessment",
      module_no: 2,
      name: "Post Assesment",
      description: "Craft effective messages",
      total_days: 10,
      lessonsCompleted: 0,
      xpEarned: 0,
    },
    {
      module_id: "resume-option",
      module_no: 3,
      name: "Resume option",
      description: "Optimize your Resume",
      total_days: 5,
      lessonsCompleted: 0,
      xpEarned: 0,
    },
  ];

  const getProcessedModules = () => {
    return STATIC_MODULES.map((moduleItem) => {
      // For this static UI, we'll manually set statuses to match the screenshot
      let newStatus: "completed" | "in_progress" | "locked" = "locked";
      if (moduleItem.name === "Pre Assesment") newStatus = "completed";
      else if (moduleItem.name === "CEFR Score") newStatus = "in_progress";
      else newStatus = "locked";

      return {
        module_id: moduleItem.module_id,
        module_no: moduleItem.module_no,
        name: moduleItem.name,
        subtitle: moduleItem.description,
        status: newStatus,
        lessonsCompleted: moduleItem.lessonsCompleted,
        totalLessons: moduleItem.total_days,
        xpEarned: moduleItem.xpEarned,
      };
    });
  };

  const modules = getProcessedModules();

  // We no longer need the global isLoading/isError for modules since they are static

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
          onPress={() => router.push("/profile")}
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
                    pathname: "/modules/assessment-result",
                    params: { moduleId: module.module_id },
                  });
                } else {
                  router.push(`/modules/${module.module_id}`);
                }
              }}
            />
          ))}
        </Card>
      </View>
    </View>
  );
};
