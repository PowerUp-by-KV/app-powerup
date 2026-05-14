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

  const completedStageNos = useAppSelector(
    (state) => state.progress.completedDays["global-journey"] || [],
  );

  const stages = [
    {
      id: "stage-1",
      no: 1,
      name: "Pre Assesment",
      subtitle: "Master the fundamentals",
      lessonsCompleted: 1,
      totalLessons: 1,
      xpEarned: 30,
    },
    {
      id: "stage-2",
      no: 2,
      name: "Curriculum",
      subtitle: "Challenge yourself",
      lessonsCompleted: 0,
      totalLessons: 12,
      xpEarned: 0,
    },
    {
      id: "stage-3",
      no: 3,
      name: "Post Assesment",
      subtitle: "Craft effective messages",
      lessonsCompleted: 0,
      totalLessons: 1,
      xpEarned: 0,
    },
    {
      id: "stage-4",
      no: 4,
      name: "Resume option",
      subtitle: "Optimize your Resume",
      lessonsCompleted: 0,
      totalLessons: 1,
      xpEarned: 0,
    },
  ];

  let foundCurrent = false;
  const processedStages = stages.map((stage) => {
    const isCompleted = completedStageNos.includes(stage.no);
    if (foundCurrent) {
      return { ...stage, status: "locked" as const };
    }
    if (!isCompleted) {
      foundCurrent = true;
      return { ...stage, status: "in_progress" as const };
    }
    return { ...stage, status: "completed" as const };
  });

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
          Track where you're headed
        </Text>
      </View>

      <View className="flex-1 px-4">
        <Card className="p-4 mb-6 rounded-[24px] shadow-sm bg-white border border-[#F1F5F9]">
          {processedStages.map((stage, index) => (
            <ModuleTimelineItem
              key={stage.id}
              title={stage.name}
              subtitle={stage.subtitle}
              status={stage.status}
              lessonsCompleted={stage.lessonsCompleted}
              totalLessons={stage.totalLessons}
              xpEarned={stage.xpEarned}
              isLast={index === processedStages.length - 1}
              onPress={() => {
                if (stage.name === "Pre Assesment") {
                  router.push({
                    pathname: "/(tabs)/my-learning/modules/assessment-result",
                    params: { moduleId: "pre-assessment" },
                  });
                } else if (stage.name === "Curriculum") {
                  router.push("/(tabs)/my-learning/modules");
                }
              }}
            />
          ))}
        </Card>
      </View>
    </View>
  );
};
