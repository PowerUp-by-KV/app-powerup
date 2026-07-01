import React, { useState } from "react";
import { FlatList, Pressable, Text, View, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  useGetLeaderboardQuery,
  type LeaderboardPeriod,
  type LeaderboardEntry,
} from "@/services/social-api";

import { useGetProfileQuery } from "@/services/auth-api";
import { getAvatarUri } from "@/utils/avatar";

import { FriendsModal } from "./components/FriendsModal";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";

const PERIODS: LeaderboardPeriod[] = ["weekly", "monthly", "yearly"];
import { SafeFlatListProps } from "@/types";

const LeaderboardFlatList = FlatList as unknown as React.ComponentType<
  SafeFlatListProps<LeaderboardEntry>
>;

export function LeaderboardScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const { data, isLoading } = useGetLeaderboardQuery({ period });
  const [friendsOpen, setFriendsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useThemeToggle();

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
    let blockColors: [string, string] = ["#dbeafe", "#93c5fd"]; // Blue (3rd)
    let avatarColors: [string, string] = ["#dbeafe", "#bfdbfe"];
    let textNameColor = "#1e3a8a";
    let textPointsColor = "#2563eb";
    let avatarBorderColor = "#93c5fd";
    let isFirst = false;

    if (position === "middle") {
      avatarSize = 72;
      blockHeight = 115;
      blockColors = ["#d9f99d", "#bef264"]; // Lime-green (1st)
      avatarColors = ["#fef08a", "#facc15"]; // Gold
      textNameColor = "#3f6212";
      textPointsColor = "#4d7c0f";
      avatarBorderColor = "#a3e635";
      isFirst = true;
    } else if (position === "left") {
      avatarSize = 56;
      blockHeight = 85;
      blockColors = ["#ebd5ff", "#c084fc"]; // Lavender (2nd)
      avatarColors = ["#fae8ff", "#ebd5ff"];
      textNameColor = "#581c87";
      textPointsColor = "#701a75";
      avatarBorderColor = "#c084fc";
    }

    return (
      <View className="items-center" style={{ width: 90 }}>
        {/* Avatar Container */}
        <View
          className="items-center justify-center mb-2 relative"
          style={{ width: avatarSize, height: avatarSize }}
        >
          {isFirst && (
            <Text style={{ position: "absolute", top: -16, fontSize: 18, zIndex: 10 }}>👑</Text>
          )}
          <LinearGradient
            colors={avatarColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: avatarSize / 2,
              borderWidth: 2,
              borderColor: avatarBorderColor,
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={{
                uri: getAvatarUri(
                  (e.is_you || e.user_id === profile?.id) && profile?.avatar_id
                    ? profile.avatar_id
                    : e.avatar,
                  e.user_id,
                ),
              }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </LinearGradient>
        </View>

        {/* Podium Block */}
        <LinearGradient
          colors={blockColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            height: blockHeight,
            width: "100%",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className="w-full h-full items-center justify-center px-1">
            <Text
              style={{
                fontWeight: "900",
                textAlign: "center",
                fontSize: isFirst ? 13 : 11,
                color: textNameColor,
              }}
              numberOfLines={1}
            >
              {e.name}
            </Text>
            <Text
              style={{
                fontWeight: "800",
                fontSize: 10,
                textAlign: "center",
                marginTop: 2,
                color: textPointsColor,
              }}
            >
              {e.points} xp
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top }}
      className={isDark ? "bg-[#06070f]" : "bg-white"}
    >
      <View style={{ flex: 1, width: "100%", position: "relative" }}>
        <View className="px-5 pt-10 pb-3 flex-row justify-between items-center">
          <View>
            <Text
              className={`text-2xl font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}
            >
              Leaderboards
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <Pressable
              onPress={toggleTheme}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? "bg-slate-700" : "bg-slate-200"
              }`}
            >
              <Feather
                name={isDark ? "sun" : "moon"}
                size={18}
                color={isDark ? "#f8fafc" : "#1e293b"}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/profile" as never)}
              className={`w-12 h-12 rounded-full items-center justify-center overflow-hidden active:opacity-80 ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-slate-200 border-slate-100"
              }`}
            >
              <Image
                source={{
                  uri: getAvatarUri(profile?.avatar_id, profile?.id),
                }}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
            </Pressable>
          </View>
        </View>

        {/* Tab Selector */}
        <View
          className="flex-row rounded-full p-1 mx-5 mb-5"
          style={{
            gap: 4,
            backgroundColor: isDark ? "rgba(148, 163, 184, 0.15)" : "#ebd5ff40",
            borderWidth: 1,
            borderColor: isDark ? "rgba(100, 116, 139, 0.35)" : "#ebd5ff60",
          }}
        >
          {PERIODS.map((p) => {
            const isActive = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-full items-center justify-center ${
                  isActive
                    ? isDark
                      ? "bg-slate-700 shadow-xs"
                      : "bg-white shadow-xs"
                    : "bg-transparent"
                }`}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    textTransform: "capitalize",
                    color: isActive ? (isDark ? "#f8fafc" : "#1e293b") : "#8b5cf6",
                  }}
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
              <LinearGradient
                colors={["#f8fafc", "#f1f5f9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  padding: 20,
                  marginBottom: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: "#ebd5ff",
                }}
                className="shadow-sm"
              >
                <View
                  className="pr-3"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: "auto",
                  }}
                >
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
                  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "auto" }}>
                    <Text className="text-slate-500 text-xs font-bold">You Are Doing Better</Text>
                    <Text className="text-slate-400 text-xs font-semibold mt-0.5">
                      Than {data?.better_than_count ?? 0} Players!!
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LottieView
                    source={require("../../../assets/lottie/trophy.json")}
                    autoPlay
                    loop
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
              </LinearGradient>

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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140 + Math.max(0, insets.bottom),
          }}
          renderItem={({ item }: { item: LeaderboardEntry }) => (
            <View
              className={`border rounded-3xl p-4 mb-3 shadow-xs ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
              }`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                className="pr-3"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: "auto",
                }}
              >
                <View
                  className={`w-10 h-10 rounded-full mr-3 overflow-hidden justify-center items-center border ${
                    isDark ? "bg-slate-800 border-slate-700/50" : "bg-slate-100 border-slate-200/50"
                  }`}
                >
                  <Image
                    source={{
                      uri: getAvatarUri(
                        (item.is_you || item.user_id === profile?.id) && profile?.avatar_id
                          ? profile.avatar_id
                          : item.avatar,
                        item.user_id,
                      ),
                    }}
                    className="w-full h-full"
                    style={{ resizeMode: "cover" }}
                  />
                </View>
                <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "auto" }}>
                  <Text
                    className={`font-extrabold text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}
                    numberOfLines={1}
                  >
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
          className="absolute right-5 w-14 h-14 rounded-full overflow-hidden shadow-lg active:opacity-90"
          style={{
            bottom: 80 + Math.max(0, insets.bottom),
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
    </View>
  );
}
