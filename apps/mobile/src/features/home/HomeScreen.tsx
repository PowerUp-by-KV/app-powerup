import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Star,
  Zap,
  Play,
  ChevronRight,
  Book,
  Flame,
  Medal,
  MessageCircle,
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight,
  PenTool,
} from "lucide-react-native";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { useProgress } from "@/features/progress/hooks/ProgressContext";
import { useAppSelector } from "@/store/hooks";
import { selectTotalTime } from "@/store/slices/timeTrackingSlice";
import { selectCefrLevel } from "@/store/slices/authSlice";

import { Card } from "@/components/ui";
import { AIChatbot } from "./components/AIChatbot";

const { width } = Dimensions.get("window");

const DEFAULT_TOTAL_MODULES = 6;
const DEFAULT_COMPLETED_MODULES = 2;
const DAILY_GOAL_SECONDS = 1800;

export const HomeScreen = () => {
  const { data: userProfile } = useGetUserProfileQuery("user-1");
  const { user: contextUser } = useUser();
  const { summary } = useProgress();

  const userName = userProfile?.name || contextUser?.name || "User";
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;
  const userStreak = userProfile?.streak ?? contextUser?.streak ?? 0;

  const totalModules = summary?.modules?.length || DEFAULT_TOTAL_MODULES;
  const completedModules =
    summary?.modules?.filter((m) => m.status === "Done" || m.status === "Mastery").length ||
    DEFAULT_COMPLETED_MODULES;

  const [isChatVisible, setIsChatVisible] = useState(false);

  const totalSeconds = useAppSelector(selectTotalTime);
  const progress = Math.min(Math.round((totalSeconds / DAILY_GOAL_SECONDS) * 100), 100);
  const lastActivity = useAppSelector((state) => state.progress.lastActivity);
  const completedDays = useAppSelector((state) => state.progress.completedDays);
  const cefrLevel = useAppSelector(selectCefrLevel);

  const getNextResumableActivity = () => {
    if (lastActivity) return lastActivity;

    // Find the first incomplete stage
    const stages = ["m1", "m2", "m3", "m4"];
    for (const stageId of stages) {
      // Check if stage is completed in global-journey
      const completedStages = completedDays["global-journey"] || [];
      const stageNo = parseInt(stageId.replace("m", ""));
      if (completedStages.includes(stageNo)) continue;

      // Check sub-modules in this stage
      const completedSubModules = completedDays[stageId] || [];
      for (let subNo = 1; subNo <= 12; subNo++) {
        const subModuleId = `placeholder-${subNo}`;

        // If sub-module is not completed, find the first incomplete day in it
        if (!completedSubModules.includes(subNo)) {
          const completedInSub = completedDays[subModuleId] || [];
          for (let dayNo = 1; dayNo <= 12; dayNo++) {
            if (!completedInSub.includes(dayNo)) {
              return {
                moduleId: subModuleId,
                dayNo,
                stageId,
                cefrLevel,
                activityTitle: `Day ${dayNo} Practice`,
                isNewDay: true,
              };
            }
          }
        }
      }
    }
    return null;
  };

  const nextActivity = getNextResumableActivity();

  const daysRow = ["M", "T", "W", "T", "F", "S", "S"];

  const getWeeklyActivity = () => {
    const activity = new Array(7).fill(false);
    const today = new Date();
    const dayOfWeek = today.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    for (let i = 0; i < (userStreak || 3); i++) {
      const dayIndex = adjustedDay - i;
      if (dayIndex >= 0) activity[dayIndex] = true;
    }
    return activity;
  };

  const activityStatus = getWeeklyActivity();

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-[28px] text-[#1E293B] font-bold">
              Hi, {userName.split(" ")[0]}!
            </Text>
            <Text className="text-sm text-[#94A3B8] font-medium">
              Ready to learn something new?
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] items-center justify-center"
            onPress={() => router.push("/profile")}
          >
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} className="w-full h-full rounded-full" />
            ) : (
              <View className="w-7 h-7 rounded-full bg-[#F1F5F9]" />
            )}
          </TouchableOpacity>
        </View>

        {/* Weekly Streak */}
        <View className="bg-white p-4 rounded-3xl mb-4 border border-[#F1F5F9] shadow-sm elevation-2">
          <Text className="text-center text-[15px] text-[#1E293B] font-bold mb-3">
            Weekly Streak
          </Text>
          <View className="flex-row justify-between px-2">
            {daysRow.map((day, index) => (
              <View key={index} className="items-center">
                <View
                  className={`w-[42px] h-[42px] rounded-full justify-center items-center mb-1.5 ${
                    activityStatus[index] ? "bg-[#475569]" : "bg-[#F1F5F9]"
                  }`}
                >
                  {activityStatus[index] && <Flame size={20} color="white" />}
                </View>
                <Text className="text-xs font-bold text-[#94A3B8]">{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* My Learning */}
        <View className="bg-white p-5 rounded-[28px] mb-4 border border-[#F1F5F9] shadow-sm elevation-2">
          <Text className="text-center text-base text-[#1E293B] font-bold mb-4">My Learning</Text>
          <View className="flex-row justify-between mb-4">
            {[
              { label: "2 Streaks", icon: <Flame size={14} color="white" /> },
              { label: "12 Badges", icon: <Medal size={14} color="white" /> },
              { label: "30 XP", icon: <Zap size={14} color="white" /> },
            ].map((stat, i) => (
              <View
                key={i}
                className="bg-[#64748B] w-[31%] h-14 rounded-2xl items-center justify-center"
              >
                <View className="mb-1">{stat.icon}</View>
                <Text className="text-[10px] text-white font-bold">{stat.label}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-[#94A3B8] text-xs font-bold">
              {completedModules}/{totalModules} modules
            </Text>
            <Text className="text-[#94A3B8] text-xs font-bold">{progress}%</Text>
          </View>
          <View className="h-2 w-full bg-[#F1F5F9] rounded overflow-hidden mb-4">
            <View style={{ width: `${progress}%` }} className="h-full bg-[#475569]" />
          </View>
          <TouchableOpacity
            className="bg-[#475569] rounded-2xl items-center py-3.5"
            onPress={() => router.push("/(tabs)/my-learning")}
          >
            <Text className="text-white text-[15px] font-bold">Track My Learning</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Learning */}
        <View style={{ marginBottom: 16 }}>
          <View className="flex-row justify-between items-center mb-2.5 px-1">
            <Text className="text-lg text-[#1E293B] font-bold">Continue Learning</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/my-learning")}>
              <Text className="text-[13px] text-[#94A3B8] font-bold">View All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (nextActivity) {
                router.push({
                  pathname: "/(tabs)/my-learning/lesson/[moduleId]/[dayNo]",
                  params: {
                    moduleId: nextActivity.moduleId,
                    dayNo: nextActivity.dayNo.toString(),
                    cefr_level: nextActivity.cefrLevel || cefrLevel,
                    stageId: nextActivity.stageId,
                  },
                });
              } else {
                router.push("/(tabs)/my-learning");
              }
            }}
            className="flex-row items-center p-4.5 rounded-3xl bg-white border border-[#F1F5F9]"
          >
            <View className="w-12 h-12 rounded-2xl bg-[#64748B] items-center justify-center mr-5">
              <BookOpen size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg text-[#1E293B] font-bold">
                {nextActivity?.activityTitle || "Resume Learning"}
              </Text>
              <Text className="text-[13px] text-[#94A3B8] font-medium">
                {nextActivity
                  ? (nextActivity as any).isNewDay
                    ? "Next Lesson"
                    : "Resume Lesson"
                  : "Start Learning"}
              </Text>
            </View>
            <ChevronRight size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Convo Coach Card */}
        <View className="bg-white p-5 rounded-[32px] mb-4 border border-[#F1F5F9] shadow-sm elevation-2">
          <View className="flex-row items-center mb-3">
            <View className="w-11 h-11 rounded-full bg-[#64748B] items-center justify-center mr-4">
              <Sparkles size={20} color="white" />
            </View>
            <View>
              <Text className="text-base text-[#1E293B] font-bold">Convo Coach</Text>
              <Text className="text-[11px] text-[#94A3B8] font-medium">
                Say it better, every time
              </Text>
            </View>
          </View>
          <View>
            {[
              { title: "Interview Playground", sub: "Try, learn and improve - No pressure" },
              { title: "Interview Buddy", sub: "Practice with a buddy before it counts" },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} className="bg-[#F1F5F9] rounded-2xl p-3 px-4 mb-2">
                <Text className="text-[#1E293B] text-[14px] font-bold">{item.title}</Text>
                <Text className="text-[10px] text-[#94A3B8] font-medium">{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resume Studio Card */}
        <View className="bg-white p-5 rounded-[32px] mb-4 border border-[#F1F5F9] shadow-sm elevation-2">
          <View className="flex-row items-center mb-3">
            <View className="w-11 h-11 rounded-full bg-[#64748B] items-center justify-center mr-4">
              <PenTool size={20} color="white" />
            </View>
            <View>
              <Text className="text-base text-[#1E293B] font-bold">Resume Studio</Text>
              <Text className="text-[11px] text-[#94A3B8] font-medium">
                Build a resume you're proud to share
              </Text>
            </View>
          </View>
          <View>
            {[
              { title: "Resume Buddy", sub: "Know what recruiters notice" },
              { title: "Craft your Resume", sub: "Design your story, your way" },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} className="bg-[#F1F5F9] rounded-2xl p-3 px-4 mb-2">
                <Text className="text-[#1E293B] text-[14px] font-bold">{item.title}</Text>
                <Text className="text-[10px] text-[#94A3B8] font-medium">{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Chat Button */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => setIsChatVisible(true)}>
        <View className="absolute bottom-6 right-8 w-[60px] h-[60px] rounded-full bg-[#475569] items-center justify-center z-50 shadow-md elevation-10">
          <MessageCircle size={28} color="white" />
        </View>
      </TouchableOpacity>

      <AIChatbot visible={isChatVisible} onClose={() => setIsChatVisible(false)} />
    </View>
  );
};
