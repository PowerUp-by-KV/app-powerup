import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  Image,
  useWindowDimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { LinearGradient } from "expo-linear-gradient";

import { useGetProfileQuery } from "@/services/auth-api";
import { useListAchievementsQuery, type Achievement } from "@/services/gamification-api";
import { getAvatarUri } from "@/utils/avatar";

import { StatTile } from "./components/StatTile";

function ProgressBar({ pct }: { pct: number }) {
  const { isDark } = useThemeToggle();
  const w = Math.min(100, Math.max(0, Math.round(pct * 100)));
  return (
    <View
      className={`h-1.5 rounded-[3px] mt-2 overflow-hidden ${isDark ? "bg-[#232540]" : "bg-[#ECEEF8]"}`}
    >
      <View className="h-full bg-[#7174F6]" style={{ width: `${w}%` }} />
    </View>
  );
}

function AchievementCard({ a, locked }: { a: Achievement; locked: boolean }) {
  const { isDark } = useThemeToggle();

  return (
    <View
      className={`rounded-2xl p-4 mb-2 border ${
        isDark
          ? locked
            ? "bg-[#1A1B31] border-[rgba(113,116,246,0.08)]"
            : "bg-[#1A1B31] border-[rgba(113,116,246,0.15)] border-l-4 border-l-[#B4E426]"
          : locked
            ? "bg-[#F8F8FF] border-[#ECEEF8]"
            : "bg-white border-[#ECEEF8] border-l-4 border-l-[#B4E426]"
      }`}
    >
      <View className="flex-row items-start">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: locked ? (isDark ? "#232540" : "#ECEEF8") : "#7174F6" }}
        >
          <Feather
            name={locked ? "lock" : "award"}
            size={18}
            color={locked ? (isDark ? "#8B93A8" : "#A0A7B8") : "#fff"}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className={`font-bold ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
              {a.title}
            </Text>
            <Text
              className={
                "text-xs font-bold " +
                (locked ? "text-[#A0A7B8] dark:text-[#8B93A8]" : "text-[#7174F6]")
              }
            >
              +{a.xp_reward} XP
            </Text>
          </View>
          <Text className={`text-xs mt-0.5 ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}>
            {a.description}
          </Text>
          {locked && a.progress_label && (
            <>
              <Text className={`text-xs mt-2 ${isDark ? "text-[#8B93A8]" : "text-[#A0A7B8]"}`}>
                {a.progress_label}
              </Text>
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
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-[#F4F5FA] dark:bg-[#0F1020]">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: isTablet ? 32 : 20, paddingBottom: 96 }}
      >
        <View style={{ width: "100%" }}>
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-[#1B1F35] dark:text-white text-2xl font-extrabold">
                Your Achievements!
              </Text>
            </View>
            <View className="flex-row items-center space-x-3">
              <Pressable
                onPress={() => toggleTheme()}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDark
                    ? "bg-[#232540] border border-[rgba(113,116,246,0.15)]"
                    : "bg-[#F8F8FF] border border-[#ECEEF8]"
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
                className={`w-12 h-12 rounded-full items-center justify-center overflow-hidden active:opacity-80 border ${
                  isDark
                    ? "bg-[#232540] border-[rgba(113,116,246,0.15)]"
                    : "bg-[#F8F8FF] border-[#ECEEF8]"
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

          {/* Trophy Header Display */}
          <View className="items-center mb-6 py-2">
            <LinearGradient
              colors={isDark ? ["#232540", "#1A1B31"] : ["#7174F6", "#5D6EF2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-24 h-24 items-center justify-center mb-3 rounded-full"
              style={{
                shadowColor: "#7174F6",
                shadowOpacity: isDark ? 0.2 : 0.15,
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
            </LinearGradient>
            <Text className="text-[#6B7280] dark:text-[#B7BED1] font-bold text-sm text-center">
              Congratulations for your 1st{"\n"}trophy!
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row mb-3" style={{ gap: 8 }}>
            <StatTile
              type="xp"
              value={profile?.total_xp ?? 0}
              onPress={() => router.push("/achievements/xp" as never)}
            />
            <StatTile
              type="badges"
              value={profile?.badges_count ?? 0}
              onPress={() => router.push("/achievements/medals" as never)}
            />
          </View>
          <View className="flex-row mb-6" style={{ gap: 8 }}>
            <StatTile
              type="accuracy"
              value="—"
              onPress={() => router.push("/achievements/accuracy" as never)}
            />
            <StatTile
              type="level"
              value={profile?.current_level ?? 1}
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
                    isActive ? "bg-[#7174F6] shadow-sm shadow-[#7174F6]/25" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isActive ? "text-white" : isDark ? "text-[#8B93A8]" : "text-[#7C8599]"
                    }`}
                  >
                    {t === "achievements" ? "Achievements" : "Skills"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {tab === "achievements" ? (
            listLoading ? (
              <ActivityIndicator color="#7174F6" />
            ) : (
              <>
                {list && list.recent.length > 0 && (
                  <>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className={`font-bold ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
                        Recent
                      </Text>
                      <Pressable onPress={() => router.push("/achievements/list" as never)}>
                        <Text className="text-[#7174F6] text-sm font-semibold">View All</Text>
                      </Pressable>
                    </View>
                    {list.recent.map((a) => (
                      <AchievementCard key={a.id} a={a} locked={false} />
                    ))}
                  </>
                )}
                {list && list.locked.length > 0 && (
                  <>
                    <Text
                      className={`font-bold mt-4 mb-2 ${isDark ? "text-white" : "text-[#1B1F35]"}`}
                    >
                      Locked
                    </Text>
                    {list.locked.map((a) => (
                      <AchievementCard key={a.id} a={a} locked />
                    ))}
                  </>
                )}
                {list && list.recent.length === 0 && list.locked.length === 0 && (
                  <Text
                    className={`text-center mt-8 ${isDark ? "text-[#8B93A8]" : "text-[#A0A7B8]"}`}
                  >
                    No achievements seeded yet. Check back soon.
                  </Text>
                )}
              </>
            )
          ) : (
            <View>
              {/* Roadmap Header */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className={`text-lg font-black ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
                  Skills
                </Text>
                <Text
                  className={`text-xs font-bold ${isDark ? "text-[#8B93A8]" : "text-[#A0A7B8]"}`}
                >
                  3/6 unlocked
                </Text>
              </View>

              {/* Roadmap Map Box */}
              <View
                className={`rounded-3xl p-6 border relative ${
                  isDark
                    ? "bg-[#1A1B31] border-[rgba(113,116,246,0.15)]"
                    : "bg-white border-[#ECEEF8] shadow-sm shadow-[#7174F6]/5"
                }`}
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
                    borderColor: isDark ? "rgba(113,116,246,0.15)" : "#D8D7F7",
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
                    borderColor: isDark ? "rgba(113,116,246,0.15)" : "#D8D7F7",
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
                    borderColor: isDark ? "rgba(113,116,246,0.15)" : "#D8D7F7",
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
                    borderColor: isDark ? "rgba(113,116,246,0.15)" : "#D8D7F7",
                  }}
                />

                {/* Row 1 Nodes */}
                <View
                  className="flex-row justify-between items-center mb-12"
                  style={{ paddingHorizontal: 10 }}
                >
                  {/* Node 1: Book open (active) */}
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-[#B4E426] items-center justify-center shadow-md">
                      <Feather name="book-open" size={20} color="#fff" />
                    </View>
                  </View>

                  {/* Node 2: Code (active) */}
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-[#B4E426] items-center justify-center shadow-md">
                      <Feather name="code" size={20} color="#fff" />
                    </View>
                  </View>

                  {/* Node 3: Smile/Brain (inactive) */}
                  <View className="items-center">
                    <View
                      className={`w-12 h-12 rounded-full border-2 items-center justify-center ${
                        isDark ? "bg-[#232540] border-[#232540]" : "bg-[#ECEEF8] border-[#D8D7F7]"
                      }`}
                    >
                      <Feather name="smile" size={20} color={isDark ? "#8B93A8" : "#A0A7B8"} />
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
                    <View
                      className={`w-12 h-12 rounded-full border-2 items-center justify-center ${
                        isDark ? "bg-[#232540] border-[#232540]" : "bg-[#ECEEF8] border-[#D8D7F7]"
                      }`}
                    >
                      <Feather name="compass" size={20} color={isDark ? "#8B93A8" : "#A0A7B8"} />
                    </View>
                  </View>

                  {/* Node 5: Crown/Award (inactive) */}
                  <View className="items-center">
                    <View
                      className={`w-12 h-12 rounded-full border-2 items-center justify-center ${
                        isDark ? "bg-[#232540] border-[#232540]" : "bg-[#ECEEF8] border-[#D8D7F7]"
                      }`}
                    >
                      <Feather name="award" size={20} color={isDark ? "#8B93A8" : "#A0A7B8"} />
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
