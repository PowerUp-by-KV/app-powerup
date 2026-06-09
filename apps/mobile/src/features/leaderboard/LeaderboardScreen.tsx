import React, { useState } from "react";
import { FlatList, Pressable, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { resolveApiAssetUrl } from "@/services/api";

import {
  useGetLeaderboardQuery,
  type LeaderboardPeriod,
  type LeaderboardEntry,
} from "@/services/social-api";

import { FriendsModal } from "./components/FriendsModal";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";

const PERIODS: LeaderboardPeriod[] = ["weekly", "monthly", "yearly"];
import { SafeFlatListProps } from "@/types";

const LeaderboardFlatList = FlatList as unknown as React.ComponentType<
  SafeFlatListProps<LeaderboardEntry>
>;

export function LeaderboardScreen() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const { data, isLoading } = useGetLeaderboardQuery({ period });
  const [friendsOpen, setFriendsOpen] = useState(false);

  if (isLoading) {
    return <GamifiedMascotLoader title="Loading Leaderboard..." />;
  }

  const firstPlace = data?.top3.find((x) => x.rank === 1);
  const secondPlace = data?.top3.find((x) => x.rank === 2);
  const thirdPlace = data?.top3.find((x) => x.rank === 3);

  const renderPodiumItem = (e: typeof firstPlace, position: "left" | "middle" | "right") => {
    if (!e) return <View style={{ width: 90 }} />;

    let avatarSize = 56;
    let blockHeight = 65;
    let blockBg = "#bfdbfe"; // Blue (3rd)
    let textNameColor = "text-blue-950";
    let textPointsColor = "text-blue-800";
    let avatarBorderColor = "border-blue-300 bg-blue-100";
    let isFirst = false;

    if (position === "middle") {
      avatarSize = 72;
      blockHeight = 115;
      blockBg = "#d9f99d"; // Lime-green (1st)
      textNameColor = "text-emerald-950";
      textPointsColor = "text-emerald-800";
      avatarBorderColor = "border-lime-300 bg-lime-100";
      isFirst = true;
    } else if (position === "left") {
      avatarSize = 56;
      blockHeight = 85;
      blockBg = "#e9d5ff"; // Lavender (2nd)
      textNameColor = "text-purple-950";
      textPointsColor = "text-purple-800";
      avatarBorderColor = "border-purple-300 bg-purple-100";
    }

    return (
      <View className="items-center" style={{ width: 90 }}>
        {/* Avatar Container */}
        <View
          className="items-center justify-center mb-1.5 relative"
          style={{ width: avatarSize, height: avatarSize }}
        >
          {isFirst && (
            <Text style={{ position: "absolute", top: -16, fontSize: 18, zIndex: 10 }}>👑</Text>
          )}
          <View
            className={`w-full h-full rounded-full border-2 overflow-hidden justify-center items-center ${avatarBorderColor}`}
          >
            {e.avatar ? (
              <Image
                source={{ uri: resolveApiAssetUrl(`/static/avatars/${e.avatar}.png`) ?? undefined }}
                className="w-full h-full"
              />
            ) : (
              <Feather name="user" size={isFirst ? 28 : 20} color="#94a3b8" />
            )}
          </View>
        </View>

        {/* Podium Block */}
        <View
          className="w-full rounded-t-2xl overflow-hidden shadow-xs"
          style={{ height: blockHeight, backgroundColor: blockBg }}
        >
          <View className="w-full h-full items-center justify-center px-1">
            <Text
              className={`font-black text-center ${isFirst ? "text-xs" : "text-[10px]"} ${textNameColor}`}
              numberOfLines={1}
            >
              {e.name}
            </Text>
            <Text className={`font-extrabold text-[9px] text-center mt-0.5 ${textPointsColor}`}>
              {e.points} xp
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <View style={{ flex: 1, width: "100%", position: "relative" }}>
        <View className="px-5 pt-10 pb-3">
          <Text className="text-slate-900 text-2xl font-extrabold">Leaderboards</Text>
        </View>

        {/* Tab Selector */}
        <View className="flex-row bg-slate-100/80 rounded-full p-1 mx-5 mb-5" style={{ gap: 4 }}>
          {PERIODS.map((p) => {
            const isActive = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-full items-center justify-center ${
                  isActive ? "bg-white shadow-xs" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-bold capitalize ${
                    isActive ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <LeaderboardFlatList
          ListHeaderComponent={
            <View className="px-5 pb-4">
              {/* Trophy summary card */}
              <View className="bg-white border border-slate-100 rounded-3xl p-5 mb-5 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center flex-1 pr-3">
                  <Text className="text-slate-800 text-3xl font-black mr-4">
                    #
                    {data?.your_rank === 1
                      ? "1st"
                      : data?.your_rank === 2
                        ? "2nd"
                        : data?.your_rank === 3
                          ? "3rd"
                          : `${data?.your_rank ?? 0}th`}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-slate-500 text-xs font-bold leading-normal">
                      You Are Doing Better{"\n"}Than {data?.better_than_count ?? 0} Players!!
                    </Text>
                  </View>
                </View>
                <Image
                  source={require("../../../assets/images/trophy_silver.png")}
                  style={{ width: 64, height: 64 }}
                  resizeMode="contain"
                />
              </View>

              {/* Podium section */}
              {data && data.top3.length > 0 && (
                <View className="flex-row justify-center items-end mb-6 pt-5" style={{ gap: 12 }}>
                  {renderPodiumItem(secondPlace, "left")}
                  {renderPodiumItem(firstPlace, "middle")}
                  {renderPodiumItem(thirdPlace, "right")}
                </View>
              )}
            </View>
          }
          data={data?.list ?? []}
          keyExtractor={(item: LeaderboardEntry) => item.user_id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}
          renderItem={({ item }: { item: LeaderboardEntry }) => (
            <View className="bg-white border border-slate-100 rounded-3xl p-4 mb-3 flex-row items-center justify-between shadow-xs">
              <View className="flex-row items-center flex-1 pr-3">
                <View className="w-10 h-10 rounded-full bg-slate-100 mr-3 overflow-hidden justify-center items-center border border-slate-200/50">
                  {item.avatar ? (
                    <Image
                      source={{
                        uri: resolveApiAssetUrl(`/static/avatars/${item.avatar}.png`) ?? undefined,
                      }}
                      className="w-full h-full"
                    />
                  ) : (
                    <Feather name="user" size={18} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-slate-800 font-extrabold text-sm" numberOfLines={1}>
                    {item.is_you ? `${item.name} (You)` : item.name}
                  </Text>
                  <Text className="text-slate-400 text-xs font-bold mt-0.5">
                    {item.rank === 1
                      ? "1st Rank"
                      : item.rank === 2
                        ? "2nd Rank"
                        : item.rank === 3
                          ? "3rd Rank"
                          : `${item.rank}th rank`}
                  </Text>
                </View>
              </View>
              <Text className="text-slate-500 font-extrabold text-xs">{item.points} xp</Text>
            </View>
          )}
        />

        {/* FAB with lime-green gradient */}
        <Pressable
          onPress={() => setFriendsOpen(true)}
          className="absolute right-5 bottom-20 w-14 h-14 rounded-full overflow-hidden shadow-lg active:opacity-90"
          style={{
            shadowColor: "#84cc16",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={["#ecfccb", "#d9f99d"]}
            className="w-full h-full items-center justify-center"
          >
            <Feather name="user-plus" size={22} color="#3f6212" />
          </LinearGradient>
        </Pressable>

        <FriendsModal visible={friendsOpen} onClose={() => setFriendsOpen(false)} />
      </View>
    </SafeAreaView>
  );
}
