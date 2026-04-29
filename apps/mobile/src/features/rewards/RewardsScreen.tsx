import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useGetUserProfileQuery } from "@/services/user-api";
import {
  Trophy,
  Medal,
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  Code,
  Lock,
  Brain,
  Rocket,
  Lightbulb,
  Crown,
  Share,
} from "lucide-react-native";
import { LucideIcon } from "lucide-react-native";

export const RewardsScreen = () => {
  const [activeTab, setActiveTab] = useState<"Achievements" | "Skills">("Achievements");
  const { data: userProfile } = useGetUserProfileQuery("user-1");
  const profile = userProfile || { name: "User", streak: 0, points: 2438 };

  const StatsCard = ({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: string | number;
    icon?: LucideIcon;
  }) => (
    <View className="bg-[#475569] p-4 rounded-[20px] flex-1 shadow-sm shadow-black/20">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
          {title}
        </Text>
        {Icon && <Icon size={14} color="white" />}
      </View>
      <View className="flex-row items-baseline">
        <Text className="text-white text-xl font-bold">{value}</Text>
        {title === "Level" && <TrendingUp size={14} color="#10B981" className="ml-1" />}
      </View>
    </View>
  );

  const AchievementItem = ({
    icon: Icon,
    title,
    desc,
    xp,
    time,
    isLocked,
    accentColor = "#3B82F6",
  }: {
    icon: LucideIcon;
    title: string;
    desc: string;
    xp: string | number;
    time: string;
    isLocked?: boolean;
    accentColor?: string;
  }) => (
    <View
      className={`flex-row items-center bg-[#EFF6FF] p-3 rounded-[20px] mb-2 ${isLocked ? "opacity-60" : ""}`}
    >
      <View
        style={{ backgroundColor: isLocked ? "#F1F5F9" : `${accentColor}15` }}
        className="w-10 h-10 rounded-xl items-center justify-center mr-3 shadow-sm shadow-blue-200"
      >
        {isLocked ? <Lock size={16} color="#64748B" /> : <Icon size={20} color={accentColor} />}
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text
            style={{ color: isLocked ? "#64748B" : accentColor }}
            className="font-bold text-[14px]"
          >
            {title}
          </Text>
          <Text style={{ color: accentColor }} className="font-bold text-[10px]">
            +{xp} XP
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-0.5">
          <Text className="text-[#64748B] text-[11px] font-medium">{desc}</Text>
          <Text className="text-[#94A3B8] text-[9px]">{time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row justify-between items-center">
        <Text className="text-2xl font-black text-[#1E3A8A]">Your Achievements!</Text>
        <TouchableOpacity
          style={{ backgroundColor: "#1D4ED8" }}
          className="w-10 h-10 rounded-full items-center justify-center shadow-md shadow-blue-400"
        >
          <Text className="text-white text-[12px] font-black">JD</Text>
        </TouchableOpacity>
      </View>

      <View className="h-[0.5px] bg-[#EFF6FF] w-full" />

      {/* Main Content (No Scroll) */}
      <View className="flex-1 px-6 pt-4 justify-between">
        <View>
          {/* Spotlight Trophy Card */}
          <View className="bg-[#DBEAFE] p-6 rounded-[24px] items-center mb-5 relative overflow-hidden">
            {/* Abstract BG elements */}
            <View className="absolute right-0 top-[-40px] w-20 h-20 rounded-full bg-[#3B82F6]/20" />
            <View className="absolute right-[-10px] top-[10px] w-24 h-24 rounded-full bg-[#3B82F6]/30" />

            <Trophy size={50} color="#1E3A8A" strokeWidth={1.5} />
            <Text className="text-[#1E3A8A] font-bold text-center mt-3 px-4 text-sm">
              Congratulations for your 1st trophy !
            </Text>
          </View>

          {/* 2x2 Stats Grid */}
          <View className="mb-6">
            <View className="flex-row gap-x-4 mb-4">
              <StatsCard title="XP Points" value={profile.points} />
              <TouchableOpacity className="flex-1" onPress={() => router.push("/rewards")}>
                <StatsCard title="Medals" value="" icon={Medal} />
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-x-4">
              <TouchableOpacity className="flex-1" onPress={() => router.push("/rewards")}>
                <StatsCard title="Accuracy" value="" icon={Target} />
              </TouchableOpacity>
              <StatsCard title="Level" value="8" />
            </View>
          </View>

          {/* Tab Switcher */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => setActiveTab("Achievements")}
              className={`px-6 py-2 rounded-xl mr-3 ${activeTab === "Achievements" ? "bg-[#DBEAFE]" : ""}`}
            >
              <Text
                className={`text-[13px] font-bold ${activeTab === "Achievements" ? "text-[#1E3A8A]" : "text-[#94A3B8]"}`}
              >
                Achievements
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("Skills")}
              className={`px-6 py-2 rounded-xl ${activeTab === "Skills" ? "bg-[#DBEAFE]" : ""}`}
            >
              <Text
                className={`text-[13px] font-bold ${activeTab === "Skills" ? "text-[#1E3A8A]" : "text-[#94A3B8]"}`}
              >
                Skills
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View className="mb-2">
            {activeTab === "Achievements" ? (
              <View>
                <AchievementItem
                  icon={BookOpen}
                  title="First Steps"
                  desc="Complete your first lesson"
                  xp="50"
                  time="2 days ago"
                  accentColor="#10B981"
                />
                <AchievementItem
                  icon={Zap}
                  title="Speed Learner"
                  desc="Complete 3 lessons in one day"
                  xp="300"
                  time="Today"
                  accentColor="#F59E0B"
                />
                <AchievementItem
                  icon={Lock}
                  title="Week Warrior"
                  desc="Complete the challenge to unlock"
                  xp="300"
                  time="Today"
                  isLocked
                />
              </View>
            ) : (
              <View className="bg-[#475569] rounded-[24px] p-5 h-[220px] overflow-hidden border border-slate-700 shadow-inner">
                <View className="flex-row justify-between items-center mb-4 absolute top-4 left-5 right-5 z-10">
                  <Text className="text-white font-bold text-sm">Skills</Text>
                  <Text className="text-slate-300 text-[10px] font-bold">3/6 unlocked</Text>
                </View>

                <View className="flex-1 mt-6 relative">
                  {/* Simplified Connections (Manual rendering with absolute views) */}
                  <View
                    style={{
                      position: "absolute",
                      top: "15%",
                      left: "15%",
                      width: "20%",
                      height: 2,
                      backgroundColor: "#94A3B840",
                      transform: [{ rotate: "30deg" }],
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: "40%",
                      left: "35%",
                      width: "25%",
                      height: 2,
                      backgroundColor: "#94A3B840",
                      transform: [{ rotate: "0deg" }],
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: "40%",
                      left: "35%",
                      width: "15%",
                      height: 2,
                      backgroundColor: "#94A3B840",
                      transform: [{ rotate: "60deg" }],
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: "65%",
                      left: "25%",
                      width: "25%",
                      height: 2,
                      backgroundColor: "#1E293B60",
                      transform: [{ rotate: "20deg" }],
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: "35%",
                      left: "60%",
                      width: "20%",
                      height: 2,
                      backgroundColor: "#1E293B60",
                      transform: [{ rotate: "45deg" }],
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: "75%",
                      left: "50%",
                      width: "30%",
                      height: 2,
                      backgroundColor: "#1E293B60",
                      transform: [{ rotate: "-15deg" }],
                    }}
                  />

                  {/* Nodes (Matching the specific layout in image 1152) */}
                  {/* 1. Book (Unlocked) */}
                  <View className="absolute top-[5%] left-[10%] w-11 h-11 rounded-full bg-[#94A3B8] items-center justify-center shadow-lg shadow-black/20">
                    <BookOpen size={18} color="white" />
                  </View>

                  {/* 2. Code (Unlocked) - using Code2/Terminal if Brackets not available, but let's use code-brackets style */}
                  <View className="absolute top-[30%] left-[30%] w-11 h-11 rounded-full bg-[#94A3B8] items-center justify-center shadow-lg shadow-black/20">
                    <Code size={18} color="white" />
                  </View>

                  {/* 3. Brain (Locked) */}
                  <View className="absolute top-[25%] left-[55%] w-11 h-11 rounded-full bg-[#334155] items-center justify-center shadow-lg shadow-black/20">
                    <Brain size={18} color="#94A3B8" />
                  </View>

                  {/* 4. Lightbulb (Unlocked) */}
                  <View className="absolute top-[60%] left-[20%] w-11 h-11 rounded-full bg-[#94A3B8] items-center justify-center shadow-lg shadow-black/20">
                    <Lightbulb size={18} color="white" />
                  </View>

                  {/* 5. Rocket (Locked) */}
                  <View className="absolute top-[70%] left-[45%] w-11 h-11 rounded-full bg-[#334155] items-center justify-center shadow-lg shadow-black/20">
                    <Rocket size={18} color="#94A3B8" />
                  </View>

                  {/* 6. Crown (Locked/Target) */}
                  <View className="absolute top-[45%] left-[75%] w-14 h-14 rounded-full bg-[#1E293B] items-center justify-center shadow-2xl shadow-black/40">
                    <Crown size={28} color="#94A3B8" />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer Share Button */}
        <View className="pb-6">
          <TouchableOpacity activeOpacity={0.8} className="shadow-lg shadow-blue-900/40">
            <LinearGradient
              colors={["#3B82F6", "#1E40AF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 18, marginRight: 8 }}>
                Share
              </Text>
              <Share size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
