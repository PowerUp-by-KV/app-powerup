import React, { useState } from "react";
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { BADGES, USER_PROFILE, LEARNING_MODULES } from "@/constants/mockData";
import {
  Award,
  ArrowLeft,
  Star,
  Lock,
  Trophy,
  Zap,
  Medal,
  Target,
  Flame,
  ChevronRight,
  BookOpen,
  Check,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSelector } from "@/store/hooks";
import { selectTimeForModule } from "@/store/slices/timeTrackingSlice";

/**
 * High-Fidelity Learning Dashboard & Rewards Screen
 */
export const RewardsScreen = () => {
  const [activeTab, setActiveTab] = useState<"Badges" | "Challenges">("Badges");

  const earnedBadgesCount = BADGES.filter((b) => b.earned).length;

  const mockChallenges = [
    {
      id: "q1",
      title: "Grammar",
      desc: "Complete 2 grammar exercises",
      progress: 1,
      total: 2,
      xp: 50,
      icon: "book",
    },
    {
      id: "q2",
      title: "Speaking ",
      desc: "Practice speaking for 10 mins",
      progress: 10,
      total: 10,
      xp: 100,
      completed: true,
      icon: "mic",
    },
    {
      id: "q3",
      title: "Reading ",
      desc: "Read 3 articles",
      progress: 0,
      total: 3,
      xp: 75,
      icon: "book-open",
    },
  ];

  const renderHeader = () => (
    <View className="mb-2.5">
      <LinearGradient colors={["#6366F1", "#4F46E5"]} className="pb-[25px] rounded-b-[40px]">
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-5 pt-10">
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-white/20 justify-center items-center"
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">Learning Dashboard</Text>
            <TouchableOpacity className="w-11 h-11 rounded-full bg-white/20 justify-center items-center">
              <Flame size={24} color="#FF8C42" fill="#FF8C42" />
            </TouchableOpacity>
          </View>

          <View className="mt-[25px] px-5">
            <View className="flex-row justify-between">
              <View className="flex-1 bg-white/15 mx-[5px] py-[15px] rounded-[20px] items-center border border-white/20">
                <Flame size={32} color="#FF8C42" fill="#FF8C42" />
                <Text className="text-white text-xl font-bold mt-2">{USER_PROFILE.streak}</Text>
                <Text className="text-[#E0E7FF] text-[10px] font-medium">Day Streak</Text>
              </View>
              <View className="flex-1 bg-white/15 mx-[5px] py-[15px] rounded-[20px] items-center border border-white/20">
                <Zap size={32} color="#FFD700" fill="#FFD700" />
                <Text className="text-white text-xl font-bold mt-2">{USER_PROFILE.points}</Text>
                <Text className="text-[#E0E7FF] text-[10px] font-medium">Total XP</Text>
              </View>
              <View className="flex-1 bg-white/15 mx-[5px] py-[15px] rounded-[20px] items-center border border-white/20">
                <Trophy size={32} color="#FFFFFF" fill="rgba(255,255,255,0.3)" />
                <Text className="text-white text-xl font-bold mt-2">{earnedBadgesCount}</Text>
                <Text className="text-[#E0E7FF] text-[10px] font-medium">Badges</Text>
              </View>
            </View>
          </View>

          <View className="flex-row bg-black/20 mx-5 mt-[25px] rounded-[25px] p-1">
            <TouchableOpacity
              className={`flex-1 py-3 items-center rounded-[22px] ${activeTab === "Badges" ? "bg-white" : ""}`}
              onPress={() => setActiveTab("Badges")}
            >
              <Text
                className={`text-sm font-bold ${activeTab === "Badges" ? "text-[#6366F1]" : "text-[#E0E7FF]"}`}
              >
                Badges
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 items-center rounded-[22px] ${activeTab === "Challenges" ? "bg-white" : ""}`}
              onPress={() => setActiveTab("Challenges")}
            >
              <Text
                className={`text-sm font-bold ${activeTab === "Challenges" ? "text-[#6366F1]" : "text-[#E0E7FF]"}`}
              >
                Daily Challenges
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const renderMasterySection = () => (
    <View className="mt-5 mb-2.5">
      <View className="flex-row justify-between items-center px-5 mb-[15px]">
        <Text className="text-lg text-[#1E293B] font-bold">Skill Mastery</Text>
        <TouchableOpacity>
          <Text className="text-[#6366F1] text-sm font-bold">View Details</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
      >
        {LEARNING_MODULES.map((module) => {
          const seconds = useAppSelector((state) => selectTimeForModule(state, module.id));
          const masteryPercent = Math.min(Math.round((seconds / 600) * 100), 100);

          return (
            <View
              key={module.id}
              className="bg-white w-[120px] p-[15px] rounded-[24px] mr-3 items-center shadow-sm shadow-black/5 elevation-2"
            >
              <LinearGradient
                colors={module.gradient as any}
                className="w-11 h-11 rounded-[15px] justify-center items-center mb-2.5"
              >
                <BookOpen size={24} color="#FFF" />
              </LinearGradient>
              <Text className="text-[13px] text-[#1E293B] font-bold mb-2 capitalize">
                {module.title}
              </Text>
              <View className="h-1 w-full bg-[#F1F5F9] rounded-sm overflow-hidden">
                <View
                  style={{ width: `${masteryPercent}%`, backgroundColor: module.gradient[0] }}
                  className="h-full rounded-sm"
                />
              </View>
              <Text className="text-[10px] text-[#64748B] mt-1 font-medium">
                {seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`} spent
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderBadgeItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className={`mb-5 rounded-[30px] bg-white shadow-md shadow-[#6366F1]/10 elevation-4 ${!item.earned ? "opacity-70 bg-[#F1F5F9]" : ""}`}
      style={{ width: "47%" }}
      activeOpacity={0.9}
    >
      <View className="p-5 items-center">
        <View
          className={`w-[70px] h-[70px] rounded-full justify-center items-center mb-3 relative ${item.earned ? "bg-[#F0F9FF]" : "bg-[#F8FAFC]"}`}
        >
          <Award
            size={40}
            color={item.earned ? "#6366F1" : "#94A3B8"}
            fill={item.earned ? "rgba(99,102,241,0.2)" : "transparent"}
          />
          {!item.earned && (
            <View className="absolute bottom-[-2px] right-[-2px] w-6 h-6 rounded-full bg-[#475569] justify-center items-center border-2 border-white">
              <Lock size={12} color="#FFF" />
            </View>
          )}
        </View>
        <Text
          className={`text-[15px] font-bold text-center ${!item.earned ? "text-[#94A3B8]" : "text-[#1E293B]"}`}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="bg-[#F1F5F9] px-2.5 py-1 rounded-lg mt-2.5">
          <Text className="text-[11px] text-[#6366F1] font-bold">+{item.points} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderChallengeItem = (challenge: any) => (
    <TouchableOpacity
      key={challenge.id}
      className="flex-row items-center bg-white p-[18px] rounded-[24px] mb-[13px] shadow-sm shadow-black/5 elevation-2"
      activeOpacity={0.8}
    >
      <View className="w-12 h-12 rounded-2xl bg-[#F1F5F9] justify-center items-center mr-[15px]">
        <Target size={24} color={challenge.completed ? "#10B981" : "#6366F1"} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-[#1E293B] font-bold">{challenge.title}</Text>
        <Text className="text-[13px] text-[#64748B] font-medium mt-0.5">{challenge.desc}</Text>
        <View className="flex-row items-center mt-2.5">
          <View className="flex-1 h-1.5 bg-[#F1F5F9] rounded-sm overflow-hidden mr-2.5">
            <View
              style={{
                width: `${(challenge.progress / challenge.total) * 100}%`,
                backgroundColor: challenge.completed ? "#10B981" : "#6366F1",
              }}
              className="h-full rounded-sm"
            />
          </View>
          <Text className="text-[11px] text-[#64748B] font-bold">
            {challenge.progress}/{challenge.total}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        {challenge.completed ? (
          <View className="w-6 h-6 rounded-full bg-[#10B981] justify-center items-center mr-2">
            <Check size={16} color="#FFF" />
          </View>
        ) : (
          <View className="bg-[#EEF2FF] px-2 py-1 rounded-lg mr-2">
            <Text className="text-[12px] text-[#6366F1] font-bold">+{challenge.xp} XP</Text>
          </View>
        )}
        <ChevronRight size={20} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {renderHeader()}
      {activeTab === "Badges" ? (
        <FlatList
          data={BADGES}
          renderItem={renderBadgeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={renderMasterySection}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row justify-between items-center mb-[15px]">
            <Text className="text-lg text-[#1E293B] font-bold"> Active Challenges</Text>
            <Text className="text-[12px] text-[#94A3B8] font-medium">Resets in 12h</Text>
          </View>
          {mockChallenges.map(renderChallengeItem)}

          <View className="flex-row justify-between items-center mt-[30px] mb-[15px]">
            <Text className="text-lg text-[#1E293B] font-bold">Streak Milestones</Text>
          </View>
          <LinearGradient
            colors={["#FFAD60", "#FF8C42"]}
            className="flex-row items-center p-[25px] rounded-[30px] mt-2.5"
          >
            <Flame size={40} color="#FFF" fill="#FFF" />
            <View className="flex-1 ml-5">
              <Text className="text-white text-lg font-bold">7-Day Warrior</Text>
              <Text className="text-white text-[13px] opacity-90 mt-0.5 font-medium">
                Complete 2 more days to unlock!
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">+500</Text>
              <Text className="text-white text-[10px] font-bold opacity-80">XP</Text>
            </View>
          </LinearGradient>
        </ScrollView>
      )}
    </View>
  );
};
