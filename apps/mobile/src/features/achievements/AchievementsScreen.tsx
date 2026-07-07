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
import {
  useListAchievementsQuery,
  useGetSkillsQuery,
  type Achievement,
} from "@/services/gamification-api";
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
  completed: number;
  total: number;
  title: string;
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
    `Z`,
  ].join(" ");
}

function SkillNode({
  node,
  scale,
  isSelected,
  onPress,
}: {
  node: SkillNodeData;
  scale: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { isDark } = useThemeToggle();
  const size = node.size * scale;
  const x = node.x * scale;
  const y = node.y * scale;
  const progress = Math.min(100, Math.max(0, node.progress));
  const clipId = `skill-clip-${node.id}`;

  // Icon needs to read against whichever surface sits behind its center.
  let iconColor = isDark ? "#bef264" : "#7174F6"; // theme-colored icon by default
  if (progress >= 50) {
    iconColor = isDark ? "#1B1F35" : "#FFFFFF"; // dark text on green (dark theme), white text on purple (light theme)
  }

  const isUnlocked = progress > 0;
  const shadowStyle =
    isUnlocked && (progress === 100 || isSelected || node.id === "book")
      ? {
          shadowColor: isDark ? "#bef264" : "#7174F6",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isDark ? 0.8 : 0.4,
          shadowRadius: isDark ? 8 : 6,
          elevation: 5,
        }
      : {};

  const borderStyle = isSelected
    ? {
        borderWidth: 3,
        borderColor: "#7174F6",
        borderRadius: size / 2,
      }
    : {};

  return (
    <Pressable
      onPress={onPress}
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
        borderStyle,
      ]}
    >
      <View
        className="w-full h-full items-center justify-center rounded-full overflow-hidden"
        style={{
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          backgroundColor: isDark ? "rgba(190, 242, 100, 0.15)" : "rgba(113, 116, 246, 0.12)",
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
    </Pressable>
  );
}

export function AchievementsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"achievements" | "skills">("achievements");
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);
  const { data: profile } = useGetProfileQuery();
  const { data: list, isLoading: listLoading } = useListAchievementsQuery();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { isDark, toggleTheme } = useThemeToggle();

  const { data: skillsData, isLoading: skillsLoading } = useGetSkillsQuery();
  const [cardWidth, setCardWidth] = useState(0);
  const DESIGN_W = 480;
  const DESIGN_H = 300;
  const scale = cardWidth ? cardWidth / DESIGN_W : 0;
  const canvasHeight = DESIGN_H * scale;

  const HARDCODED_NODES = [
    { id: "book", x: 75, y: 60, icon: "book" as const, size: 64 },
    { id: "code", x: 190, y: 100, icon: "code-tags" as const, size: 56 },
    { id: "bulb", x: 115, y: 185, icon: "lightbulb-outline" as const, size: 56 },
    { id: "brain", x: 300, y: 135, icon: "brain" as const, size: 56 },
    { id: "crown", x: 405, y: 205, icon: "crown-outline" as const, size: 56 },
    { id: "rocket", x: 265, y: 240, icon: "rocket-launch-outline" as const, size: 56 },
  ];

  const BACKEND_TO_HARDCODED_MAP: Record<string, string> = {
    book: "book",
    reading: "book",
    "book-open": "book",
    code: "code",
    grammar: "code",
    "code-tags": "code",
    ear: "bulb",
    listening: "bulb",
    "ear-hearing": "bulb",
    mic: "brain",
    speaking: "brain",
    microphone: "brain",
    speaker: "rocket",
    vocabulary: "rocket",
    vocab: "rocket",
    "volume-high": "rocket",
    crown: "crown",
    award: "crown",
    trophy: "crown",
  };

  const rawNodes = skillsData?.nodes || [];

  const NODES: SkillNodeData[] = HARDCODED_NODES.map((hn) => {
    const backendNode = rawNodes.find((bn) => {
      const mappedId = BACKEND_TO_HARDCODED_MAP[bn.id] || bn.id;
      return mappedId === hn.id;
    });

    const progress = backendNode
      ? (backendNode as any).progress !== undefined
        ? (backendNode as any).progress
        : backendNode.unlocked
          ? 100
          : 0
      : 0;

    const completed = (backendNode as any)?.completed ?? 0;
    const total = (backendNode as any)?.total ?? 0;
    const title = backendNode?.title ?? hn.id.charAt(0).toUpperCase() + hn.id.slice(1);

    return {
      id: hn.id,
      x: hn.x,
      y: hn.y,
      icon: hn.icon,
      progress,
      size: hn.size,
      fillColor: isDark ? "#bef264" : "#7174F6",
      completed,
      total,
      title,
    };
  });

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
                className="w-12 h-12 rounded-full items-center justify-center overflow-hidden border active:opacity-80"
                style={{
                  backgroundColor: isDark ? "#232540" : "#F8F8FF",
                  borderColor: isDark ? "rgba(113, 116, 246, 0.15)" : "#ECEEF8",
                }}
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
            <View className="w-24 h-24 items-center justify-center mb-3">
              <LottieView
                source={require("../../../assets/lottie/trophy.json")}
                autoPlay
                loop
                style={{ width: 80, height: 80 }}
              />
            </View>
            <Text className="text-[#6B7280] dark:text-[#B7BED1] font-bold text-sm text-center">
              Congratulations for your 1st{"\n"}trophy!
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
          <View className="w-full flex-row items-center mb-6" style={{ gap: 12 }}>
            {(["achievements", "skills"] as const).map((t) => {
              const isActive = tab === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  className={`px-5 py-2 rounded-full ${
                    isActive ? "bg-[#7174F6]" : "bg-transparent"
                  }`}
                  style={
                    isActive
                      ? {
                          shadowColor: "#7174F6",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.25,
                          shadowRadius: 2,
                          elevation: 2,
                        }
                      : undefined
                  }
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
                    <View className="w-full flex-row justify-between items-center mb-2">
                      <Text className={`font-bold ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
                        Recent
                      </Text>
                      <Pressable onPress={() => router.push("/achievements/medals" as never)}>
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
          ) : skillsLoading ? (
            <ActivityIndicator color="#7174F6" size="large" style={{ marginTop: 40 }} />
          ) : (
            <View
              className="rounded-3xl border px-5 py-5 self-center w-full"
              style={{
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
              <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className={`text-lg font-black ${isDark ? "text-white" : "text-[#1B1F35]"}`}>
                  Skills
                </Text>
                <Text
                  className={`text-xs font-bold ${isDark ? "text-[#8B93A8]" : "text-[#A0A7B8]"}`}
                >
                  {skillsData?.unlocked_count ?? 0}/{skillsData?.total_count ?? 0} unlocked
                </Text>
              </View>

              {/* Inner Roadmap Container */}
              <View
                className="rounded-2xl border p-4"
                style={{
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

                        const x1 = from.x * scale;
                        const y1 = from.y * scale;
                        const x2 = to.x * scale;
                        const y2 = to.y * scale;

                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist === 0) return null;

                        // Radii of the circles to subtract from center points
                        const r1 = (from.size * scale) / 2;
                        const r2 = (to.size * scale) / 2;

                        // Direction vector
                        const ux = dx / dist;
                        const uy = dy / dist;

                        // Offset coordinates so the dashed lines stop exactly at the bubble boundary
                        const startX = x1 + r1 * ux;
                        const startY = y1 + r1 * uy;
                        const endX = x2 - r2 * ux;
                        const endY = y2 - r2 * uy;

                        return (
                          <Path
                            key={fromId + "-" + toId}
                            d={`M${startX},${startY} L${endX},${endY}`}
                            stroke={isDark ? "rgba(113,116,246,0.3)" : "#94A3B8"}
                            strokeWidth={2.5}
                            strokeDasharray="6,7"
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </Svg>
                    {NODES.map((node) => (
                      <SkillNode
                        key={node.id}
                        node={node}
                        scale={scale}
                        isSelected={selectedNode?.id === node.id}
                        onPress={() => setSelectedNode(node)}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Skill Details Card when clicked */}
              {selectedNode && (
                <View
                  className={`mt-4 rounded-2xl border p-4 flex-row items-center justify-between ${
                    isDark ? "bg-[#141526] border-[#22243d]" : "bg-[#F8F9FC] border-[#E2E8F0]"
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-[#7174F6]">
                      <MaterialCommunityIcons name={selectedNode.icon} size={20} color="#fff" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-black text-sm ${isDark ? "text-white" : "text-[#1B1F35]"}`}
                      >
                        {selectedNode.title} Practice
                      </Text>
                      <Text
                        className={`text-xs mt-0.5 ${isDark ? "text-[#B7BED1]" : "text-[#6B7280]"}`}
                      >
                        {selectedNode.completed} / {selectedNode.total} activities completed (
                        {Math.round(selectedNode.progress)}%)
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => setSelectedNode(null)}
                    className="p-1 rounded-full"
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Feather name="x" size={16} color={isDark ? "#8B93A8" : "#6B7280"} />
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
