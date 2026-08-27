import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  useGetLeaderboardQuery,
  type LeaderboardPeriod,
  type LeaderboardEntry,
  type LeaderboardScope,
} from "@/services/social-api";

import { useGetProfileQuery } from "@/services/auth-api";
import { getAvatarUri } from "@/utils/avatar";

import { FriendsModal } from "./components/FriendsModal";
import { LeaderboardFilterModal, FilterState } from "./components/LeaderboardFilterModal";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { SafeFlatListProps } from "@/types";

const PERIODS: LeaderboardPeriod[] = ["weekly", "monthly", "yearly"];

const LeaderboardFlatList = FlatList as unknown as React.ComponentType<
  SafeFlatListProps<LeaderboardEntry>
>;

export function LeaderboardScreen() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [filterState, setFilterState] = useState<FilterState>({
    scope: "global",
    college: undefined,
    region: undefined,
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);

  const queryParams = useMemo(() => {
    const isFriends = filterState.scope === "friends";
    const isCollegeScope = filterState.scope === "college";
    const isRegionScope = filterState.scope === "region";

    return {
      period,
      scope: (isFriends ? "friends" : "global") as LeaderboardScope,
      college: isFriends
        ? undefined
        : isCollegeScope
          ? filterState.college || profile?.nickname || undefined
          : filterState.college,
      region: isFriends
        ? undefined
        : isRegionScope
          ? filterState.region || profile?.country || undefined
          : filterState.region,
    };
  }, [period, filterState, profile]);

  const { data: rawData, isLoading } = useGetLeaderboardQuery(queryParams);

  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();

  // Process data returned from backend filtering endpoint
  const processedData = useMemo(() => {
    if (!rawData) return null;

    const list = (rawData.list || []).map((entry, idx) => ({
      ...entry,
      rank: entry.rank || idx + 1,
      is_you: entry.is_you || entry.user_id === profile?.id,
    }));

    const rawTop3 = rawData.top3 && rawData.top3.length > 0 ? rawData.top3 : list.slice(0, 3);
    const top3 = rawTop3.map((entry, idx) => ({
      ...entry,
      rank: entry.rank || idx + 1,
      is_you: entry.is_you || entry.user_id === profile?.id,
    }));

    const yourEntry = list.find((e) => e.is_you);
    const yourRank = yourEntry ? yourEntry.rank : rawData.your_rank;
    const betterThanCount = yourEntry
      ? Math.max(0, list.length - yourRank)
      : rawData.better_than_count;

    return {
      period: rawData.period,
      your_rank: yourRank,
      your_points: yourEntry?.points ?? rawData.your_points,
      better_than_count: betterThanCount,
      top3,
      list,
    };
  }, [rawData, profile]);

  if (isLoading) {
    return <GamifiedMascotLoader title="Loading Leaderboard..." />;
  }

  const firstPlace = processedData?.top3.find((x) => x.rank === 1);
  const secondPlace = processedData?.top3.find((x) => x.rank === 2);
  const thirdPlace = processedData?.top3.find((x) => x.rank === 3);

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
              contentFit="cover"
              cachePolicy="memory-disk"
              style={{ width: "100%", height: "100%" }}
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

  const isFilterActive =
    filterState.scope !== "global" || filterState.college || filterState.region;

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top }}
      className={isDark ? "bg-[#06070f]" : "bg-white"}
    >
      <View style={{ flex: 1, width: "100%", position: "relative" }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          }}
          className="flex-row justify-between items-center"
        >
          <View>
            <Text
              className={`text-2xl font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}
            >
              Leaderboards
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
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
                contentFit="cover"
                cachePolicy="memory-disk"
                style={{ width: "100%", height: "100%" }}
              />
            </Pressable>
          </View>
        </View>

        {/* Tab Selector (Weekly, Monthly, Yearly) */}
        <View
          className="flex-row rounded-full p-1 mx-5"
          style={{
            gap: 4,
            marginTop: 16,
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

        {/* Scope / Filter Bar */}
        <View className="px-5 mt-3 mb-2 flex-row items-center">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {/* Filter Modal Button */}
            <Pressable
              onPress={() => setFilterModalOpen(true)}
              className={`flex-row items-center px-3 py-1.5 rounded-full border mr-2 ${
                isFilterActive
                  ? "bg-purple-600 border-purple-600"
                  : isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-slate-100 border-slate-200"
              }`}
            >
              <Feather
                name="sliders"
                size={14}
                color={isFilterActive ? "#ffffff" : isDark ? "#a7f3d0" : "#059669"}
              />
              <Text
                className={`text-xs font-bold ml-1.5 ${
                  isFilterActive ? "text-white" : isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Filters
              </Text>
            </Pressable>

            {/* Global Chip */}
            <Pressable
              onPress={() =>
                setFilterState({ scope: "global", college: undefined, region: undefined })
              }
              className={`flex-row items-center px-3 py-1.5 rounded-full border mr-2 ${
                filterState.scope === "global"
                  ? isDark
                    ? "bg-purple-900/60 border-purple-500"
                    : "bg-purple-100 border-purple-400"
                  : isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-50 border-slate-200"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filterState.scope === "global"
                    ? isDark
                      ? "text-purple-300"
                      : "text-purple-900"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                🌐 Global
              </Text>
            </Pressable>

            {/* College / Org Chip */}
            <Pressable
              onPress={() => {
                const targetCollege = filterState.college || profile?.nickname || undefined;
                setFilterState({ scope: "college", college: targetCollege, region: undefined });
                if (!targetCollege) {
                  setFilterModalOpen(true);
                }
              }}
              className={`flex-row items-center px-3 py-1.5 rounded-full border mr-2 ${
                filterState.scope === "college"
                  ? isDark
                    ? "bg-purple-900/60 border-purple-500"
                    : "bg-purple-100 border-purple-400"
                  : isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-50 border-slate-200"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filterState.scope === "college"
                    ? isDark
                      ? "text-purple-300"
                      : "text-purple-900"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                🎓 {filterState.college ? filterState.college : "College / Org"}
              </Text>
            </Pressable>

            {/* Region Chip */}
            <Pressable
              onPress={() => {
                const targetRegion = filterState.region || profile?.country || undefined;
                setFilterState({ scope: "region", college: undefined, region: targetRegion });
                if (!targetRegion) {
                  setFilterModalOpen(true);
                }
              }}
              className={`flex-row items-center px-3 py-1.5 rounded-full border mr-2 ${
                filterState.scope === "region"
                  ? isDark
                    ? "bg-emerald-900/60 border-emerald-500"
                    : "bg-emerald-100 border-emerald-400"
                  : isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-50 border-slate-200"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filterState.scope === "region"
                    ? isDark
                      ? "text-emerald-300"
                      : "text-emerald-900"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                📍 {filterState.region ? filterState.region : "Region"}
              </Text>
            </Pressable>

            {/* Friends Chip */}
            <Pressable
              onPress={() =>
                setFilterState({ scope: "friends", college: undefined, region: undefined })
              }
              className={`flex-row items-center px-3 py-1.5 rounded-full border mr-2 ${
                filterState.scope === "friends"
                  ? isDark
                    ? "bg-purple-900/60 border-purple-500"
                    : "bg-purple-100 border-purple-400"
                  : isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-50 border-slate-200"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filterState.scope === "friends"
                    ? isDark
                      ? "text-purple-300"
                      : "text-purple-900"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                👥 Friends
              </Text>
            </Pressable>
          </ScrollView>
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
                    {processedData?.your_rank === 1
                      ? "1st"
                      : processedData?.your_rank === 2
                        ? "2nd"
                        : processedData?.your_rank === 3
                          ? "3rd"
                          : `${processedData?.your_rank ?? 0}th`}
                  </Text>
                  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "auto" }}>
                    <Text className="text-slate-500 text-xs font-bold">You Are Doing Better</Text>
                    <Text className="text-slate-400 text-xs font-semibold mt-0.5">
                      Than {processedData?.better_than_count ?? 0} Players!!
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
              {processedData && processedData.top3.length > 0 && (
                <View className="flex-row justify-center items-end mb-6 pt-5" style={{ gap: 12 }}>
                  {renderPodiumItem(secondPlace, "left")}
                  {renderPodiumItem(firstPlace, "middle")}
                  {renderPodiumItem(thirdPlace, "right")}
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12 px-6">
              <View
                className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                  isDark ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <Feather name="filter" size={28} color={isDark ? "#94a3b8" : "#64748b"} />
              </View>
              <Text
                className={`text-base font-bold text-center mb-1 ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                No Rankings Found
              </Text>
              <Text
                className={`text-xs text-center mb-5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                No players match your selected filter criteria. Try changing or clearing your
                filters.
              </Text>
              <Pressable
                onPress={() =>
                  setFilterState({ scope: "global", college: undefined, region: undefined })
                }
                className="px-5 py-2.5 rounded-full bg-purple-600 active:opacity-90"
              >
                <Text className="text-white text-xs font-bold">Reset Filters</Text>
              </Pressable>
            </View>
          }
          data={processedData?.list ?? []}
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
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "auto" }}>
                  <Text
                    className={`font-extrabold text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}
                    numberOfLines={1}
                  >
                    {item.is_you ? `${item.name} (You)` : item.name}
                  </Text>
                  <View className="flex-row items-center flex-wrap gap-1 mt-0.5">
                    <Text className="text-slate-400 text-xs font-bold">
                      {item.rank === 1
                        ? "1st Rank"
                        : item.rank === 2
                          ? "2nd Rank"
                          : item.rank === 3
                            ? "3rd Rank"
                            : `${item.rank}th rank`}
                    </Text>
                    {item.college && (
                      <View
                        className={`px-1.5 py-0.5 rounded-md ${isDark ? "bg-purple-950/60" : "bg-purple-100/70"}`}
                      >
                        <Text
                          className={`text-[10px] font-semibold ${isDark ? "text-purple-300" : "text-purple-700"}`}
                        >
                          🎓 {item.college}
                        </Text>
                      </View>
                    )}
                    {item.region && (
                      <View
                        className={`px-1.5 py-0.5 rounded-md ${isDark ? "bg-emerald-950/60" : "bg-emerald-100/70"}`}
                      >
                        <Text
                          className={`text-[10px] font-semibold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}
                        >
                          📍 {item.region}
                        </Text>
                      </View>
                    )}
                  </View>
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

        <LeaderboardFilterModal
          visible={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          currentFilter={filterState}
          onApply={(newFilter) => setFilterState(newFilter)}
          userCollege={profile?.nickname}
          userCountry={profile?.country}
        />
      </View>
    </View>
  );
}
