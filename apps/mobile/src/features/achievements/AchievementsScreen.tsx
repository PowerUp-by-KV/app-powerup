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
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeToggle } from "@/hooks/useThemeToggle";

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

type SkillNodeData = {
  id: string;
  x: number;
  y: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  progress: number; // 0-100, comes from backend completion % for this skill
  size: number;
  fillColor: string; // color used once the bubble is unlocked/filling
};

// Builds a "water surface" path: a flat fill rect with a gentle wave along
// its top edge. Amplitude tapers to 0 at 0% and 100% so it never pokes
// outside the bubble at the extremes.
function buildWaterPath(size: number, progress: number) {
  const clamped = Math.min(100, Math.max(0, progress));
  const fillTop = size * (1 - clamped / 100);
  const amplitude = 3 * Math.sin((Math.PI * clamped) / 100);

  return [
    `M0,${fillTop}`,
    `C${size * 0.25},${fillTop - amplitude} ${size * 0.25},${fillTop - amplitude} ${size * 0.5},${fillTop}`,
    `C${size * 0.75},${fillTop + amplitude} ${size * 0.75},${fillTop + amplitude} ${size},${fillTop}`,
    `L${size},${size}`,
    `L0,${size}`,
    "Z",
  ].join(" ");
}

function SkillNode({ node, scale }: { node: SkillNodeData; scale: number }) {
  const { isDark } = useThemeToggle();
  const size = node.size * scale;
  const x = node.x * scale;
  const y = node.y * scale;
  const progress = Math.min(100, Math.max(0, node.progress));
  const clipId = `skill-clip-${node.id}`;

  // Icon needs to read against whichever surface sits behind its center —
  // once the water passes the halfway mark, switch to a dark contrast color.
  const iconColor = progress >= 50 ? "#1B1F35" : isDark ? "#A0A7B8" : "#475569";

  const isUnlocked = progress > 0;
  const shadowStyle = isUnlocked
    ? {
        shadowColor: "#bef264",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 5,
      }
    : {};

  return (
    <View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          left: x - size / 2,
          top: y - size / 2,
          borderRadius: size / 2,
        },
        shadowStyle,
      ]}
    >
      <View
        className={`w-full h-full items-center justify-center rounded-full overflow-hidden ${
          isDark ? "bg-[#232540]" : "bg-[#f1f5f9]"
        }`}
        style={{
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        }}
      >
        <Svg width={size} height={size} style={{ position: "absolute" }}>
          <Defs>
            <ClipPath id={clipId}>
              <Rect x={0} y={0} width={size} height={size} rx={size / 2} ry={size / 2} />
            </ClipPath>
          </Defs>
          <Path
            d={buildWaterPath(size, progress)}
            fill={node.fillColor}
            clipPath={`url(#${clipId})`}
          />
        </Svg>
        <MaterialCommunityIcons name={node.icon} size={size * 0.42} color={iconColor} />
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

  const padding = isTablet ? 32 : 20;
  const initialCardWidth = Math.max(280, width - padding * 2 - 40);
  const [cardWidth, setCardWidth] = useState(initialCardWidth);
  const DESIGN_W = 480;
  const DESIGN_H = 300;
  const scale = cardWidth ? cardWidth / DESIGN_W : 0;
  const canvasHeight = DESIGN_H * scale;

  const NODES: SkillNodeData[] = [
    { id: "book", x: 75, y: 60, icon: "book", progress: 100, size: 64, fillColor: "#bef264" },
    {
      id: "code",
      x: 190,
      y: 100,
      icon: "code-tags",
      progress: 100,
      size: 56,
      fillColor: "#bef264",
    },
    {
      id: "bulb",
      x: 115,
      y: 185,
      icon: "lightbulb-outline",
      progress: 100,
      size: 56,
      fillColor: "#bef264",
    },
    { id: "brain", x: 300, y: 135, icon: "brain", progress: 65, size: 56, fillColor: "#bef264" },
    {
      id: "crown",
      x: 405,
      y: 205,
      icon: "crown-outline",
      progress: 10,
      size: 56,
      fillColor: "#bef264",
    },
    {
      id: "rocket",
      x: 265,
      y: 240,
      icon: "rocket-launch-outline",
      progress: 35,
      size: 56,
      fillColor: "#bef264",
    },
  ];

  const EDGES: [string, string][] = [
    ["book", "code"],
    ["code", "bulb"],
    ["code", "brain"],
    ["bulb", "rocket"],
    ["brain", "crown"],
  ];

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-[#F4F5FA] dark:bg-[#0F1020]">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: isTablet ? 32 : 20, paddingBottom: 96 }}
      >
        <View style={{ width: "100%" }}>
          <View className="w-full flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-[#1B1F35] dark:text-white text-2xl font-extrabold">
                Your Achievements!
              </Text>
            </View>
            <View className="flex-row items-center" style={{ gap: 12 }}>
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
          <View className="items-center mb-6 py-4">
            <View className="w-32 h-32 items-center justify-center mb-4 relative">
              <LottieView
                source={require("../../../assets/lottie/trophy.json")}
                autoPlay
                loop
                style={{ width: 140, height: 140, zIndex: 1 }}
              />
            </View>
            <Text className="text-[#374151] dark:text-[#B7BED1] font-medium text-sm text-center">
              Congratulations for your 1st{"\n"}trophy !
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={{ width: "100%", flexDirection: "row", gap: 8, marginBottom: 12 }}>
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
          <View style={{ width: "100%", flexDirection: "row", gap: 8, marginBottom: 24 }}>
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
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
              gap: 12,
            }}
          >
            {(["achievements", "skills"] as const).map((t) => {
              const isActive = tab === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[
                    {
                      paddingHorizontal: 20,
                      paddingVertical: 8,
                      borderRadius: 9999,
                      backgroundColor: isActive ? "#7174F6" : "transparent",
                    },
                    isActive && {
                      shadowColor: "#7174F6",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.25,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: isActive ? "#ffffff" : isDark ? "#8B93A8" : "#7C8599",
                    }}
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
                    <View className="w-full flex-row justify-between items-center mb-2">
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
            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                padding: 20,
                alignSelf: "center",
                width: "100%",
                maxWidth: 640,
                backgroundColor: isDark ? "#1A1B31" : "#ffffff",
                borderColor: isDark ? "rgba(113, 116, 246, 0.15)" : "#ECEEF8",
                ...(!isDark && {
                  shadowColor: "#7174F6",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }),
              }}
            >
              {/* Card Header inside the card */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "900", color: isDark ? "#ffffff" : "#1B1F35" }}
                >
                  Skills
                </Text>
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: isDark ? "#8B93A8" : "#A0A7B8" }}
                >
                  3/6 unlocked
                </Text>
              </View>

              {/* Inner Roadmap Container */}
              <View
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  padding: 16,
                  backgroundColor: isDark ? "#141526" : "rgba(241, 245, 249, 0.5)",
                  borderColor: isDark ? "#22243d" : "#e2e8f0",
                }}
                onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
              >
                {cardWidth > 0 && (
                  <View style={{ width: cardWidth, height: canvasHeight }}>
                    <Svg width={cardWidth} height={canvasHeight} style={{ position: "absolute" }}>
                      {EDGES.map(([fromId, toId]) => {
                        const from = NODES.find((n) => n.id === fromId);
                        const to = NODES.find((n) => n.id === toId);
                        if (!from || !to) return null;
                        return (
                          <Path
                            key={fromId + "-" + toId}
                            d={`M${from.x * scale},${from.y * scale} L${to.x * scale},${to.y * scale}`}
                            stroke={isDark ? "rgba(113,116,246,0.15)" : "#cbd5e1"}
                            strokeWidth={2.5}
                            strokeDasharray="6,7"
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </Svg>
                    {NODES.map((node) => (
                      <SkillNode key={node.id} node={node} scale={scale} />
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
