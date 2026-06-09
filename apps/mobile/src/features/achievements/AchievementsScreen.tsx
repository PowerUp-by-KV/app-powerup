import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetProfileQuery } from "@/services/auth-api";
import { useListAchievementsQuery, type Achievement } from "@/services/gamification-api";

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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-white">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: isTablet ? 32 : 20, paddingBottom: 96 }}
      >
        <View style={{ width: "100%" }}>
          <Text className="text-slate-900 text-2xl font-extrabold mb-4">Your Achievements!</Text>

          {/* Trophy Header Display */}
          <View className="items-center mb-6 py-2">
            <View
              className="w-24 h-24 items-center justify-center mb-3 rounded-full bg-blue-50/50"
              style={{
                shadowColor: "#3b82f6",
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
                elevation: 2,
              }}
            >
              <LottieView
                source={require("../../../assets/lottie/trophy.json")}
                autoPlay
                loop
                style={{ width: 80, height: 80 }}
              />
            </View>
            <Text className="text-slate-500 font-bold text-sm text-center">
              Congratulations for your 1st{"\n"}trophy!
            </Text>
          </View>

          {/* Stats Grid */}
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

          {/* Tab toggles */}
          <View className="flex-row items-center mb-6" style={{ gap: 12 }}>
            {(["achievements", "skills"] as const).map((t) => {
              const isActive = tab === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  className={`px-5 py-2 rounded-full ${
                    isActive ? "bg-blue-500 active:bg-blue-600 shadow-sm" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-400"}`}
                  >
                    {t === "achievements" ? "Achievements" : "Skills"}
                  </Text>
                </Pressable>
              );
            })}
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
          ) : (
            <View>
              {/* Roadmap Header */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-slate-800 text-lg font-black">Skills</Text>
                <Text className="text-slate-400 text-xs font-bold">3/6 unlocked</Text>
              </View>

              {/* Roadmap Map Box */}
              <View
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative"
                style={{ minHeight: 280 }}
              >
                {/* Dashed Path Lines */}
                {/* Node 1 to Node 2 */}
                <View
                  style={{
                    position: "absolute",
                    left: "22%",
                    top: "22%",
                    width: "28%",
                    height: 2,
                    borderStyle: "dashed",
                    borderWidth: 1,
                    borderColor: "#94a3b8",
                  }}
                />
                {/* Node 2 to Node 3 */}
                <View
                  style={{
                    position: "absolute",
                    left: "58%",
                    top: "22%",
                    width: "22%",
                    height: 2,
                    borderStyle: "dashed",
                    borderWidth: 1,
                    borderColor: "#94a3b8",
                  }}
                />
                {/* Node 2 to Node 4 */}
                <View
                  style={{
                    position: "absolute",
                    left: "40%",
                    top: "40%",
                    width: 2,
                    height: "22%",
                    borderStyle: "dashed",
                    borderWidth: 1,
                    borderColor: "#94a3b8",
                  }}
                />
                {/* Node 4 to Node 5 */}
                <View
                  style={{
                    position: "absolute",
                    left: "45%",
                    top: "70%",
                    width: "30%",
                    height: 2,
                    borderStyle: "dashed",
                    borderWidth: 1,
                    borderColor: "#94a3b8",
                  }}
                />

                {/* Row 1 Nodes */}
                <View
                  className="flex-row justify-between items-center mb-12"
                  style={{ paddingHorizontal: 10 }}
                >
                  {/* Node 1: Book open (active) */}
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-lime-400 items-center justify-center shadow-md">
                      <Feather name="book-open" size={20} color="#fff" />
                    </View>
                  </View>

                  {/* Node 2: Code (active) */}
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-lime-400 items-center justify-center shadow-md">
                      <Feather name="code" size={20} color="#fff" />
                    </View>
                  </View>

                  {/* Node 3: Smile/Brain (inactive) */}
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300/60 items-center justify-center">
                      <Feather name="smile" size={20} color="#94a3b8" />
                    </View>
                  </View>
                </View>

                {/* Row 2 Nodes */}
                <View
                  className="flex-row justify-around items-center"
                  style={{ paddingHorizontal: 20 }}
                >
                  {/* Node 4: Compass (inactive) */}
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300/60 items-center justify-center">
                      <Feather name="compass" size={20} color="#94a3b8" />
                    </View>
                  </View>

                  {/* Node 5: Crown/Award (inactive) */}
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300/60 items-center justify-center">
                      <Feather name="award" size={20} color="#94a3b8" />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
