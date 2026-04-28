import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Crown, Timer } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useGetLeaderboardQuery, LeaderboardEntry } from "@/services/leaderboard-api";

/**
 * High-Fidelity Professional Leaderboard Screen.
 * Features a podium for top 3 and a sleek list for remaining ranks.
 */

export const LeaderboardScreen = () => {
  const [tab, setTab] = useState<"Weekly" | "All Time">("Weekly");
  const { data: leaderboardData } = useGetLeaderboardQuery({
    category: tab.toLowerCase(),
    limit: 20,
  });

  const displayData = leaderboardData || [];
  const topThree = displayData.slice(0, 3);
  const remaining = displayData.slice(3);

  const renderPodiumItem = (player: LeaderboardEntry, rank: number) => {
    const isFirst = rank === 1;
    const height = isFirst ? 100 : rank === 2 ? 75 : 60;

    return (
      <View key={player.userId} className="items-center flex-1">
        <View className="items-center mb-2.5 w-full">
          {isFirst && <Crown size={24} color="#FFD700" fill="#FFD700" className="mb-1" />}
          <View
            className={`w-[50px] h-[50px] rounded-full bg-white p-[3px] mb-1 relative ${isFirst ? "w-[70px] h-[70px] rounded-[35px] -mt-2.5" : ""}`}
          >
            <View className="flex-1 rounded-[40px] bg-[#6366F1] justify-center items-center">
              <Text className="text-white text-2xl font-bold">{player.name[0]}</Text>
            </View>
            <View className="absolute bottom-0 right-0 bg-white w-5 h-5 rounded-full justify-center items-center border border-[#eee]">
              <Text className="text-[10px]">🇮🇳</Text>
            </View>
          </View>
          <Text className="text-white text-sm font-bold mb-1" numberOfLines={1}>
            {player.name.split(" ")[0]}
          </Text>
          <View className="bg-black/30 px-2 py-1 rounded-xl">
            <Text className="text-white text-[10px] font-bold">
              {player.score.toLocaleString()} XP
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={
            isFirst
              ? ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]
              : ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]
          }
          style={{ height }}
          className="w-[90%] rounded-t-[15px] items-center justify-center"
        >
          <Text className="text-white text-[32px] font-black opacity-80">{rank}</Text>
        </LinearGradient>
      </View>
    );
  };

  const renderListItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 4;
    return (
      <View className="flex-row items-center bg-white mx-5 mb-2.5 p-[15px] rounded-[24px] shadow-sm shadow-black/5 elevation-2">
        <View className="w-[25px]">
          <Text className="text-sm text-[#9EA0A4] font-bold">{rank}</Text>
        </View>
        <View className="mx-3 relative">
          <View className="w-[50px] h-[50px] rounded-full bg-[#EEF2FF] justify-center items-center">
            <Text className="text-lg font-bold text-[#6366F1]">{item.name[0]}</Text>
          </View>
          <View className="absolute bottom-[-2px] right-[-2px] bg-white w-4 h-4 rounded-full justify-center items-center border border-[#eee]">
            <Text className="text-[8px]">🇮🇳</Text>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] text-black font-bold">{item.name}</Text>
          <Text className="text-[12px] text-[#9EA0A4] mt-0.5">
            {item.score.toLocaleString()} points
          </Text>
        </View>
        {index === 0 && (
          <View className="w-[30px] h-[30px] rounded-lg bg-[#F3F4F6] justify-center items-center">
            <Crown size={12} color="#9EA0A4" fill="#9EA0A4" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, height: "100%" }} className="flex-1">
      <LinearGradient colors={["#6A5AE0", "#5346B0"]} className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-2.5 mb-5">
          <TouchableOpacity
            className="w-10 h-10 justify-center"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text className="text-xl text-white font-bold">Leaderboard</Text>
          <View className="w-10" />
        </View>

        <View className="flex-row bg-black/20 mx-5 rounded-[25px] p-1 mb-[15px]">
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-[22px] ${tab === "Weekly" ? "bg-white/30" : ""}`}
            onPress={() => setTab("Weekly")}
          >
            <Text
              className={`text-sm font-bold ${tab === "Weekly" ? "text-white" : "text-white/50"}`}
            >
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-[22px] ${tab === "All Time" ? "bg-white/30" : ""}`}
            onPress={() => setTab("All Time")}
          >
            <Text
              className={`text-sm font-bold ${tab === "All Time" ? "text-white" : "text-white/50"}`}
            >
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        <View className="pt-2.5">
          <View className="items-center pb-5">
            <View className="flex-row items-end justify-center w-full px-2.5">
              {topThree[1] && renderPodiumItem(topThree[1], 2)}
              {topThree[0] && renderPodiumItem(topThree[0], 1)}
              {topThree[2] && renderPodiumItem(topThree[2], 3)}
            </View>
            <View className="flex-row items-center mt-[15px] self-end mr-6">
              <Timer size={14} color="rgba(255,255,255,0.5)" />
              <Text className="text-white/50 text-[12px] ml-1 font-bold">06d 23h 00m</Text>
            </View>
          </View>

          <LinearGradient
            colors={["#FFAD60", "#FF8C42"]}
            className="flex-row items-center mx-5 p-[18px] rounded-[24px] mt-[15px] mb-5"
          >
            <View className="w-[50px] h-[50px] rounded-full bg-black/10 justify-center items-center mr-[15px]">
              <Text className="text-white text-lg font-bold">#4</Text>
            </View>
            <Text className="text-white text-sm leading-5 font-medium">
              You are doing better than{"\n"}
              <Text className="font-black">60% of other players!</Text>
            </Text>
          </LinearGradient>
        </View>

        <FlatList
          data={remaining}
          renderItem={renderListItem}
          keyExtractor={(item) => item.userId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          className="flex-1"
        />
      </LinearGradient>
    </View>
  );
};

// export default LeaderboardScreen;
