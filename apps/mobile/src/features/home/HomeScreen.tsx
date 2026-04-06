import React, { useState } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Star, Zap, Play, ChevronRight, Book } from "lucide-react-native";
import { useUser } from "@/features/profile/hooks/UserContext";
import { useAppSelector } from "@/store/hooks";
import { selectTotalTime } from "@/store/slices/timeTrackingSlice";

import { Card } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";
import { AIButton } from "./components/AIButton";
import { LearningPath } from "./components/LearningPath/LearningPath";
import { AIChatbot } from "./components/AIChatbot";

export const HomeScreen = () => {
  const { user } = useUser();
  const [isChatVisible, setIsChatVisible] = useState(false);

  const totalSeconds = useAppSelector(selectTotalTime);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const timeDisplay = totalSeconds < 60 ? `${totalSeconds} seconds` : `${totalMinutes} minutes`;

  // Progress calculation (e.g., target 30 mins = 1800 seconds)
  const DAILY_GOAL_SECONDS = 1800;
  const progress = Math.min(Math.round((totalSeconds / DAILY_GOAL_SECONDS) * 100), 100);

  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDayIndex = new Date().getDay();

  return (
    <View style={{ flex: 1, height: "100%" }} className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 20, flexGrow: 1 }}
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-6 mt-2.5">
          <View>
            <Text className="text-[28px] text-black font-bold">
              Hi, {(user?.name || "User").split(" ")[0]}
            </Text>
            <Text className="text-sm text-[#64748B] font-medium">Ready to learn today?</Text>
          </View>

          <View className="flex-row items-center">
            <View className="flex-row mr-3">
              <View className="flex-row items-center px-2.5 py-1 rounded-xl ml-2 bg-[#F59E0B]/15">
                <Zap size={14} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-sm font-bold ml-1 text-[#F59E0B]">{user.streak || 0}</Text>
              </View>
              <View className="flex-row items-center px-2.5 py-1 rounded-xl ml-2 bg-[#6366F1]/15">
                <Star size={14} color="#6366F1" fill="#6366F1" />
                <Text className="text-sm font-bold ml-1 text-[#6366F1]">{user.points || 0}</Text>
              </View>
            </View>
            <TouchableOpacity
              className="w-[50px] h-[50px] rounded-full bg-[#6366F1] justify-center items-center"
              onPress={() => router.push("/(tabs)/profile")}
            >
              {user.avatarUri ? (
                <Image
                  source={{ uri: user.avatarUri }}
                  className="w-full h-full rounded-full"
                  style={{ resizeMode: "cover" }}
                />
              ) : (
                <Text className="text-white text-xl font-bold">{(user?.name || "U")[0]}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak Tracker Card */}
        <Card className="mb-5">
          <View className="flex-row justify-between items-center mb-[15px]">
            <Text className="text-[18px] text-black font-semibold">Weekly Streak</Text>
            <View className="flex-row items-center bg-[#F59E0B]/20 px-2.5 py-1 rounded-[15px]">
              <Zap size={18} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-sm text-[#F59E0B] ml-1 font-bold">{user.streak} Days</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            {days.map((day, index) => (
              <View key={index} className="items-center">
                <View
                  className={`w-[35px] h-[35px] rounded-full justify-center items-center ${
                    index <= currentDayIndex ? "bg-[#F59E0B]" : "bg-[#E2E8F0]"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${index <= currentDayIndex ? "text-white" : "text-[#64748B]"}`}
                  >
                    {day}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Quick Actions Row */}
        <View className="flex-row justify-between mb-5">
          <TouchableOpacity
            className="w-[48%] rounded-2xl overflow-hidden"
            activeOpacity={0.9}
            onPress={() => router.push("/subscription")}
          >
            <LinearGradient
              colors={["#FFAD60", "#FF8C42"]}
              className="p-4 h-[120px] justify-center"
            >
              <Star size={24} color="white" fill="white" />
              <Text className="text-white text-base mt-2.5 font-bold">Unlock Premium</Text>
              <Text className="text-white text-xs opacity-80 font-normal">Get AI Tutor access</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-[48%] rounded-2xl overflow-hidden"
            activeOpacity={0.9}
            onPress={() => router.push("/(tabs)/DailyQuest")}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              className="p-4 h-[120px] justify-center"
            >
              <Zap size={24} color="white" fill="white" />
              <Text className="text-white text-base mt-2.5 font-bold">Daily Quest</Text>
              <Text className="text-white text-xs opacity-80 font-normal">Earn 50 XP today</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Learning Today Section */}
        <Card className="mb-5 p-[15px]">
          <View className="flex-row items-center mb-[15px]">
            <View className="w-[60px] h-[60px] rounded-full bg-[#6366F1]/15 justify-center items-center mr-[15px]">
              <View className="w-[46px] h-[46px] rounded-full bg-white justify-center items-center">
                <Text className="text-xs text-[#6366F1] font-bold">{progress}%</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-[18px] text-black font-bold">Learning Today</Text>
              <Text className="text-sm text-[#64748B] font-normal">{timeDisplay} spent today</Text>
            </View>
          </View>

          <ProgressBar progress={progress} color="#6366F1" className="h-2 rounded-[4px] mb-5" />

          <TouchableOpacity
            className="bg-[#6366F1] flex-row justify-center items-center py-[14px] rounded-[15px]"
            onPress={() => router.push("/LearningModules")}
          >
            <Text className="text-white text-base mr-2.5 font-bold">Continue Learning</Text>
            <Play size={16} color="white" fill="white" />
          </TouchableOpacity>
        </Card>

        {/* Learning Path Hierarchy */}
        <LearningPath
          data={[
            { id: 0, title: "Pre-assessment", type: "start", status: "current" },
            { id: 1, title: "Day 1 Grammar", status: "locked" },
            { id: 2, title: "Day 2 Grammar", status: "locked" },
            { id: 3, title: "Day 3 Grammar", status: "locked" },
          ]}
          onNodePress={(node) => {
            if (node.status === "current") {
              router.push({ pathname: "/GrammarContent", params: { dayId: node.id } });
            }
          }}
          onContinuePress={() => router.push({ pathname: "/GrammarContent", params: { dayId: 0 } })}
        />

        {/* Featured Modules Header */}
        <View className="flex-row justify-between items-center mb-[15px]">
          <Text className="text-xl text-black font-bold">Featured Modules</Text>
          <TouchableOpacity onPress={() => router.push("/LearningModules")}>
            <Text className="text-sm text-[#6366F1] font-medium">See All</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Module Item */}
        <TouchableOpacity className="mb-[15px]" onPress={() => router.push("/grammar")}>
          <Card className="flex-row items-center p-[15px]">
            <View className="w-[50px] h-[50px] rounded-xl bg-[#6366F1]/20 justify-center items-center mr-[15px]">
              <Book size={24} color="#6366F1" />
            </View>
            <View className="flex-1">
              <Text className="text-base text-black font-semibold">Grammar Mastery</Text>
              <Text className="text-sm text-[#64748B] font-normal">
                Master tenses and structures
              </Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </Card>
        </TouchableOpacity>
      </ScrollView>

      <AIButton onPress={() => setIsChatVisible(true)} />
      <AIChatbot visible={isChatVisible} onClose={() => setIsChatVisible(false)} />
    </View>
  );
};
