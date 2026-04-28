import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Zap,
  ChevronRight,
  Flame,
  Medal,
  MessageCircle,
  Sparkles,
  BookOpen,
} from "lucide-react-native";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { useProgress } from "@/features/progress/hooks/ProgressContext";
import { useAppSelector } from "@/store/hooks";
import { selectTotalTime } from "@/store/slices/timeTrackingSlice";

import { Card } from "@/components/ui";

import { AIChatbot } from "./components/AIChatbot";

export const HomeScreen = () => {
  const { data: userProfile } = useGetUserProfileQuery("user-1");
  const { user: contextUser } = useUser();
  const { summary } = useProgress();

  const userName = userProfile?.name || contextUser?.name || "User";
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;
  const userStreak = userProfile?.streak ?? contextUser?.streak ?? 0;

  const totalModules = summary?.modules?.length || 6;
  const completedModules =
    summary?.modules?.filter((m) => m.status === "Done" || m.status === "Mastery").length || 2;

  const [isChatVisible, setIsChatVisible] = useState(false);

  const totalSeconds = useAppSelector(selectTotalTime);
  const progress = Math.min(Math.round((totalSeconds / 1800) * 100), 100);

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
    <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <View style={{ flex: 1 }} className="px-6 pt-1 pb-2">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-2 mt-1">
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

        {/* Weekly Streak Card */}
        <Card className="mb-2 p-3 rounded-[20px] shadow-sm bg-white border border-[#F1F5F9] flex-row items-center justify-between">
          <Text className="text-[13px] text-[#1E293B] font-bold mr-2">Streak</Text>
          <View className="flex-1 flex-row justify-between items-center pl-4">
            {daysRow.map((day, index) => (
              <View key={index} className="items-center">
                <View
                  className={`w-7 h-7 rounded-full justify-center items-center mb-0.5 ${activityStatus[index] ? "bg-[#475569]" : "bg-[#CBD5E1]/30"}`}
                >
                  {activityStatus[index] ? (
                    <Flame size={12} color="white" />
                  ) : (
                    <View className="w-3 h-3 rounded-full bg-transparent" />
                  )}
                </View>
                <Text className="text-[8px] font-bold text-[#94A3B8] uppercase">{day}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* My Learning Section */}
        <Card className="mb-2 p-3.5 rounded-[22px] shadow-sm bg-white border border-[#F1F5F9]">
          <Text className="text-center text-[14px] text-[#1E293B] font-bold mb-2.5">
            My Learning
          </Text>

          <View className="flex-row justify-between mb-3">
            {[
              { sub: "3", icon: <Flame size={14} color="white" />, colors: ["#94A3B8", "#64748B"] },
              {
                sub: "12",
                icon: <Medal size={14} color="white" />,
                colors: ["#64748B", "#475569"],
              },
              { sub: "30", icon: <Zap size={14} color="white" />, colors: ["#475569", "#1E293B"] },
            ].map((stat, i) => (
              <LinearGradient
                key={i}
                colors={stat.colors as [string, string, ...string[]]}
                className="w-[31%] h-[48px] flex-row items-center justify-center rounded-[12px] shadow-sm"
              >
                <View className="mr-1.5">{stat.icon}</View>
                <Text className="text-[12px] text-white font-bold">{stat.sub}</Text>
              </LinearGradient>
            ))}
          </View>

          <View className="flex-row justify-between items-center mb-1 px-0.5">
            <Text className="text-[#94A3B8] text-[10px] font-bold">
              {completedModules}/{totalModules} modules
            </Text>
            <Text className="text-[#94A3B8] text-[10px] font-bold">{progress}%</Text>
          </View>
          <View className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden mb-3">
            <View style={{ width: `${progress}%` }} className="h-full bg-[#475569] rounded-full" />
          </View>

          <TouchableOpacity
            className="bg-[#475569] py-2.5 rounded-[14px] items-center active:opacity-90 shadow-sm"
            onPress={() => router.push("/(tabs)/my-learning")}
          >
            <Text className="text-white text-[13px] font-extrabold">Track My Learning</Text>
          </TouchableOpacity>
        </Card>

        {/* AI Chatbot Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsChatVisible(true)}
          className="mb-2 rounded-[18px] overflow-hidden shadow-sm"
        >
          <LinearGradient
            colors={["#94A3B8", "#475569"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
            className="flex-row items-center p-2.5 px-4"
          >
            <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
              <MessageCircle size={16} color="white" />
            </View>
            <Text className="text-white text-[14px] font-bold flex-1">AI Chatbot</Text>
            <ChevronRight size={14} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Continue Learning Section */}
        <View className="mb-2">
          <View className="flex-row justify-between items-center mb-1 px-1">
            <Text className="text-[14px] text-[#1E293B] font-bold">Continue Learning</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/my-learning")}>
              <Text className="text-[10px] text-[#94A3B8] font-bold">View All</Text>
            </TouchableOpacity>
          </View>

          <Card className="flex-row items-center p-2.5 border border-[#F1F5F9] rounded-[16px]">
            <View className="w-9 h-9 rounded-xl bg-[#64748B] items-center justify-center mr-3">
              <BookOpen size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] text-[#1E293B] font-bold">Public Speaking</Text>
            </View>
            <ChevronRight size={16} color="#475569" />
          </Card>
        </View>

        {/* AI Coach Section */}
        <Card className="flex-1 p-3.5 border border-[#F1F5F9] rounded-[24px] bg-white shadow-sm">
          <View className="flex-row items-center mb-2.5">
            <View className="w-10 h-10 rounded-full bg-[#64748B] items-center justify-center mr-3 shadow-sm">
              <Sparkles size={18} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] text-[#1E293B] font-bold leading-tight">AI Coach</Text>
              <Text className="text-[9px] text-[#94A3B8] font-bold">Practice mock interviews</Text>
            </View>
          </View>

          <View className="flex-1 justify-center space-y-2">
            {[
              { title: "Mock Interview", sub: "Common questions" },
              { title: "Real world Scenario", sub: "Situations" },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                className="w-full bg-[#f1f5f9] rounded-[18px] p-2.5 px-5 mb-1.5 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-[#1E293B] text-[13px] font-bold">{item.title}</Text>
                  <Text className="text-[9px] text-[#94A3B8] font-bold">{item.sub}</Text>
                </View>
                <ChevronRight size={12} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <AIChatbot visible={isChatVisible} onClose={() => setIsChatVisible(false)} />
      </View>
    </View>
  );
};
