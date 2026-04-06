import React from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Zap, Play, ArrowLeft } from "lucide-react-native";
import { Card } from "@/features/learning/components";
import { useGetQuestsQuery } from "@/services/QuestApi";

export const DailyQuestScreen = () => {
  const { data: quests } = useGetQuestsQuery();

  const mainQuest = quests?.[0] || {
    title: "Grammar Sprint",
    description: "Correct 10 sentences in 2 minutes",
    id: "quest-1",
  };

  return (
    <View style={{ flex: 1, height: "100%" }} className="flex-1 bg-[#F8F9FA]">
      <View className="p-5 pt-[60px] bg-white rounded-b-[30px] mb-2.5">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-[#F8F9FA] justify-center items-center mb-2.5"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-[28px] text-black font-bold">Daily Quest</Text>
        <Text className="text-base text-[#64748B] font-normal">
          Complete today's challenge to earn XP
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 20, flexGrow: 1 }}
      >
        <Card className="items-center p-[30px] mb-[30px] shadow-lg elevation-5">
          <View className="w-[100px] h-[100px] rounded-full bg-[#F59E0B]/15 justify-center items-center mb-5">
            <Zap size={60} color="#F59E0B" fill="#F59E0B" />
          </View>
          <Text className="text-2xl text-black font-bold">{mainQuest.title}</Text>
          <Text className="text-base text-[#64748B] mt-2 text-center font-medium">
            {mainQuest.description}
          </Text>

          <View className="flex-row items-center mt-5 mb-[30px]">
            <Text className="text-base text-[#475569] mr-2.5 font-medium">Reward:</Text>
            <View className="bg-[#F59E0B] px-3 py-1.5 rounded-[15px]">
              <Text className="color-white text-sm font-bold">+50 XP</Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#6366F1] flex-row items-center py-[15px] px-10 rounded-[30px] w-full justify-center"
            onPress={() =>
              router.push({ pathname: "/QuestExercise", params: { questId: mainQuest.id } })
            }
          >
            <Text className="color-white text-lg mr-2.5 font-bold">Start Quest</Text>
            <Play size={18} color="#FFF" fill="#FFF" />
          </TouchableOpacity>
        </Card>

        <View className="px-2.5">
          <Text className="text-lg text-black mb-2.5 font-semibold">How it works</Text>
          <Text className="text-sm text-[#64748B] leading-[22px] font-normal">
            Daily quests are special timed exercises designed to boost your skills and reward you
            with extra XP. Complete them every day to maintain your streak and climb the
            leaderboard!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// export default DailyQuestScreen;
