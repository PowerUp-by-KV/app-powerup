import React, { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";
import {
  useGetSkillsQuery,
  useListAchievementsQuery,
  type Achievement,
} from "@/services/gamification-api";

import { StatTile } from "./components/StatTile";

function ProgressBar({ pct }: { pct: number }) {
  const w = Math.min(100, Math.max(0, Math.round(pct * 100)));
  return (
    <View className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
      <View className="h-full bg-slate-900" style={{ width: `${w}%` }} />
    </View>
  );
}

function AchievementCard({ a, locked }: { a: Achievement; locked: boolean }) {
  return (
    <View
      className={`rounded-2xl p-4 mb-2 ${locked ? "bg-slate-50 border border-slate-100" : "bg-white border border-slate-100"}`}
    >
      <View className="flex-row items-start">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: locked ? "#e2e8f0" : "#0f172a" }}
        >
          <Feather name={locked ? "lock" : "award"} size={18} color={locked ? "#64748b" : "#fff"} />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-slate-900 font-bold">{a.title}</Text>
            <Text className="text-slate-500 text-xs font-bold">+{a.xp_reward} XP</Text>
          </View>
          <Text className="text-slate-500 text-xs mt-0.5">{a.description}</Text>
          {locked && a.progress_label && (
            <>
              <Text className="text-slate-400 text-xs mt-2">{a.progress_label}</Text>
              <ProgressBar pct={a.progress} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export function AchievementsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"achievements" | "skills">("achievements");
  const { data: profile } = useGetProfileQuery();
  const { data: list, isLoading: listLoading } = useListAchievementsQuery();
  const { data: skills, isLoading: skillsLoading } = useGetSkillsQuery(undefined, {
    skip: tab !== "skills",
  });

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        <Text className="text-slate-900 text-2xl font-extrabold mb-4">Your Achievements!</Text>

        <View className="bg-slate-200 rounded-3xl p-6 items-center mb-5">
          <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mb-2">
            <Text className="text-3xl">🏆</Text>
          </View>
          <Text className="text-slate-900 font-bold text-center">
            Congratulations for your 1st trophy!
          </Text>
        </View>

        <View className="flex-row mb-3" style={{ gap: 8 }}>
          <StatTile
            label="XP Points"
            value={profile?.total_xp ?? 0}
            icon="zap"
            onPress={() => router.push("/achievements/xp" as never)}
          />
          <StatTile
            label="Badges"
            value={profile?.badges_count ?? 0}
            icon="award"
            onPress={() => router.push("/achievements/medals" as never)}
          />
        </View>
        <View className="flex-row mb-6" style={{ gap: 8 }}>
          <StatTile
            label="Accuracy"
            value="—"
            icon="target"
            onPress={() => router.push("/achievements/accuracy" as never)}
          />
          <StatTile
            label="Level"
            value={profile?.current_level ?? 1}
            icon="trending-up"
            onPress={() => router.push("/achievements/level" as never)}
          />
        </View>

        <View className="flex-row mb-4" style={{ gap: 8 }}>
          {(["achievements", "skills"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full ${tab === t ? "bg-slate-900" : "bg-white border border-slate-200"}`}
            >
              <Text className={`text-sm font-bold ${tab === t ? "text-white" : "text-slate-600"}`}>
                {t === "achievements" ? "Achievements" : "Skills"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "achievements" ? (
          listLoading ? (
            <ActivityIndicator color="#6366f1" />
          ) : (
            <>
              {list && list.recent.length > 0 && (
                <>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-900 font-bold">Recent</Text>
                    <Pressable onPress={() => router.push("/achievements/list" as never)}>
                      <Text className="text-indigo-600 text-sm font-semibold">View All</Text>
                    </Pressable>
                  </View>
                  {list.recent.map((a) => (
                    <AchievementCard key={a.id} a={a} locked={false} />
                  ))}
                </>
              )}
              {list && list.locked.length > 0 && (
                <>
                  <Text className="text-slate-900 font-bold mt-4 mb-2">Locked</Text>
                  {list.locked.map((a) => (
                    <AchievementCard key={a.id} a={a} locked />
                  ))}
                </>
              )}
              {list && list.recent.length === 0 && list.locked.length === 0 && (
                <Text className="text-slate-400 text-center mt-8">
                  No achievements seeded yet. Check back soon.
                </Text>
              )}
            </>
          )
        ) : skillsLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <View className="bg-white rounded-3xl p-6 border border-slate-100">
            <Text className="text-slate-900 font-bold mb-1">
              Skills {skills?.unlocked_count ?? 0}/{skills?.total_count ?? 0} unlocked
            </Text>
            <Text className="text-slate-500 text-xs mb-4">Tap a node to view skill details</Text>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {skills?.nodes.map((n) => (
                <View
                  key={n.id}
                  className={`w-20 h-20 rounded-2xl items-center justify-center ${n.unlocked ? "bg-slate-900" : "bg-slate-100"}`}
                >
                  <Feather
                    name={n.unlocked ? "check-circle" : "lock"}
                    size={18}
                    color={n.unlocked ? "#fff" : "#64748b"}
                  />
                  <Text
                    className={`text-xs font-semibold mt-1 ${n.unlocked ? "text-white" : "text-slate-500"}`}
                  >
                    {n.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
