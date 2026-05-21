import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import {
  useGetLeaderboardQuery,
  type LeaderboardPeriod,
  type LeaderboardEntry,
} from "@/services/social-api";

import { FriendsModal } from "./components/FriendsModal";

const PERIODS: LeaderboardPeriod[] = ["weekly", "monthly", "yearly"];

const TypedFlatList = FlatList as any;

export function LeaderboardScreen() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const { data, isLoading } = useGetLeaderboardQuery({ period });
  const [friendsOpen, setFriendsOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <View className="px-5 pt-10 pb-3">
        <Text className="text-slate-900 text-2xl font-extrabold">Leaderboard</Text>
      </View>
      <View className="flex-row px-5 pb-4" style={{ gap: 8 }}>
        {PERIODS.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full ${period === p ? "bg-slate-900" : "bg-white border border-slate-200"}`}
          >
            <Text
              className={`text-xs font-bold capitalize ${period === p ? "text-white" : "text-slate-600"}`}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color="#6366f1" />
      ) : (
        <TypedFlatList
          ListHeaderComponent={
            <View className="px-5 pb-4">
              <View className="bg-slate-900 rounded-3xl p-5 mb-5">
                <Text className="text-white text-3xl font-extrabold">#{data?.your_rank ?? 0}</Text>
                <Text className="text-slate-300 mt-1">
                  You Are Doing Better Than {data?.better_than_count ?? 0} Players
                </Text>
              </View>

              {data && data.top3.length > 0 && (
                <View className="flex-row justify-around items-end mb-5">
                  {[1, 0, 2].map((podiumIdx) => {
                    const e = data.top3[podiumIdx];
                    if (!e) return <View key={podiumIdx} style={{ width: 80 }} />;
                    const heights = [70, 95, 60];
                    return (
                      <View key={e.user_id} className="items-center" style={{ width: 80 }}>
                        <View className="w-12 h-12 rounded-full bg-slate-300 mb-1" />
                        <Text className="text-slate-900 text-xs font-bold" numberOfLines={1}>
                          {e.name}
                        </Text>
                        <Text className="text-slate-500 text-xs mb-1">{e.points} pts</Text>
                        <View
                          className="w-full bg-slate-200 rounded-t-2xl items-center justify-end pb-2"
                          style={{ height: heights[podiumIdx] }}
                        >
                          <Text className="text-slate-700 font-extrabold">#{e.rank}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          }
          data={data?.list ?? []}
          keyExtractor={(item: LeaderboardEntry) => item.user_id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}
          renderItem={({ item }: { item: LeaderboardEntry }) => (
            <View
              className={`flex-row items-center rounded-2xl p-3 mb-2 ${item.is_you ? "bg-slate-900" : "bg-white border border-slate-100"}`}
            >
              <View className="w-7 h-7 rounded-full bg-slate-300 mr-3" />
              <View className="flex-1">
                <Text className={`font-semibold ${item.is_you ? "text-white" : "text-slate-900"}`}>
                  {item.is_you ? "You" : item.name}
                </Text>
                <Text className={`text-xs ${item.is_you ? "text-slate-300" : "text-slate-500"}`}>
                  {item.points} pts
                </Text>
              </View>
              <Text
                className={`font-bold text-sm ${item.is_you ? "text-white" : "text-slate-700"}`}
              >
                #{item.rank}
              </Text>
            </View>
          )}
        />
      )}

      <Pressable
        onPress={() => setFriendsOpen(true)}
        className="absolute right-5 bottom-20 w-14 h-14 rounded-full bg-slate-900 items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Feather name="users" size={22} color="#fff" />
      </Pressable>

      <FriendsModal visible={friendsOpen} onClose={() => setFriendsOpen(false)} />
    </SafeAreaView>
  );
}
