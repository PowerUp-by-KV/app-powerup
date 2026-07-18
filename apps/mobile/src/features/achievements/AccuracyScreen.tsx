/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  G,
  Line,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import { useGetAccuracyQuery, type AccuracyScope } from "@/services/gamification-api";

const SCOPES: { key: AccuracyScope; label: string }[] = [
  { key: "learning", label: "Learning" },
  { key: "interview_playground", label: "Interview Playground" },
  { key: "interview_buddy", label: "Interview Buddy" },
];

function GlassStatCard({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 rounded-[16px] overflow-hidden border-t border-[rgba(255,255,255,0.4)] shadow-sm">
      <LinearGradient
        colors={["#829BFF", "#3F64F9"]}
        className="px-2 py-2 items-center"
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text className="text-[rgba(255,255,255,0.9)] text-[11px] mb-0.5">{label}</Text>
        <Text className="text-white font-extrabold text-[20px] leading-tight">
          {value.toLocaleString()}
        </Text>
      </LinearGradient>
    </View>
  );
}

function CustomLineChart({
  communication,
  behavior,
  isDark,
}: {
  communication: any[];
  behavior: any[];
  isDark: boolean;
}) {
  const svgWidth = 320;
  const svgHeight = 220;
  const padX = 35;
  const padY = 20;
  const chartW = svgWidth - padX - 15;
  const chartH = svgHeight - padY * 2;

  const maxX = Math.max(
    ...(communication?.map((d) => d.x) || [1]),
    ...(behavior?.map((d) => d.x) || [1]),
    1,
  );

  const mapX = (x: number) => padX + (x / maxX) * chartW;
  const mapY = (y: number) => svgHeight - padY - (y / 100) * chartH;

  const buildPath = (data: any[]) => {
    if (!data || data.length === 0) return "";
    return data.map((d, i) => `${i === 0 ? "M" : "L"} ${mapX(d.x)} ${mapY(d.y)}`).join(" ");
  };

  const commPath = buildPath(communication || []);
  const behPath = buildPath(behavior || []);

  const yLabels = [20, 40, 60, 80, 100];

  return (
    <View className="items-center w-full">
      <Svg width="100%" height={240} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* Grid Lines */}
        {yLabels.map((yVal) => (
          <G key={yVal}>
            <Line
              x1={padX}
              y1={mapY(yVal)}
              x2={svgWidth - 10}
              y2={mapY(yVal)}
              stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
              strokeDasharray="4 4"
            />
            <SvgText x={padX - 8} y={mapY(yVal) + 4} fill="#6B7280" fontSize="10" textAnchor="end">
              {yVal}
            </SvgText>
          </G>
        ))}

        {/* Line Paths */}
        {commPath ? <Path d={commPath} fill="none" stroke="#D4E95E" strokeWidth="2.5" /> : null}
        {behPath ? <Path d={behPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" /> : null}

        {/* Comm Data Points */}
        {communication?.map((d, i) => (
          <G key={`comm-${i}`}>
            <Circle
              cx={mapX(d.x)}
              cy={mapY(d.y)}
              r="4"
              fill="#D4E95E"
              stroke={isDark ? "#212332" : "#ffffff"}
              strokeWidth="1.5"
            />
            {d.label && i % 2 === 0 && (
              <G transform={`translate(${mapX(d.x)}, ${mapY(d.y) + 16})`}>
                <Rect
                  x="-35"
                  y="-10"
                  width="70"
                  height="18"
                  rx="9"
                  fill={isDark ? "rgba(255,255,255,0.95)" : "#333333"}
                />
                <SvgText
                  x="0"
                  y="3"
                  fill={isDark ? "#1B1F35" : "#ffffff"}
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {d.label}
                </SvgText>
              </G>
            )}
          </G>
        ))}

        {/* Beh Data Points */}
        {behavior?.map((d, i) => (
          <G key={`beh-${i}`}>
            <Circle
              cx={mapX(d.x)}
              cy={mapY(d.y)}
              r="4"
              fill="#3B82F6"
              stroke={isDark ? "#212332" : "#ffffff"}
              strokeWidth="1.5"
            />
            {d.label && i % 2 !== 0 && (
              <G transform={`translate(${mapX(d.x)}, ${mapY(d.y) - 16})`}>
                <Rect
                  x="-40"
                  y="-12"
                  width="80"
                  height="18"
                  rx="9"
                  fill={isDark ? "rgba(255,255,255,0.95)" : "#333333"}
                />
                <SvgText
                  x="0"
                  y="1"
                  fill={isDark ? "#1B1F35" : "#ffffff"}
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {d.label}
                </SvgText>
              </G>
            )}
          </G>
        ))}
      </Svg>

      <Text className="text-[#6B7280] text-[11px] mb-4">
        Communication and Behaviour Score analysis
      </Text>

      {/* Legend */}
      <View className="flex-row w-full justify-center px-4 mb-2">
        <View className="flex-row items-center mr-8">
          <View className="w-3 h-3 rounded-full bg-[#D4E95E] mr-2" />
          <Text className="text-[#8B93A8] text-[13px]">Communication</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-[#3B82F6] mr-2" />
          <Text className="text-[#8B93A8] text-[13px]">Behavior</Text>
        </View>
      </View>
    </View>
  );
}

export function AccuracyScreen() {
  const safeBack = useSafeBack("/(tabs)/achievements");
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<AccuracyScope>("learning");
  const { data, isLoading } = useGetAccuracyQuery(scope);
  const { isDark } = useThemeToggle();

  const percentage = data?.overall?.percentage ?? 0;
  const ringRadius = 45;
  const ringStroke = 12;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset = ringCircumference - (percentage / 100) * ringCircumference;

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={isDark ? "bg-[#0F1020]" : "bg-slate-50"}
    >
      <View
        className={`flex-row items-center px-4 py-3 border-b ${isDark ? "border-[rgba(255,255,255,0.02)]" : "border-slate-200"}`}
      >
        <Pressable
          onPress={() => safeBack()}
          className={`w-10 h-10 items-center justify-center rounded-full ${isDark ? "bg-[#1A1C29]" : "bg-white border border-slate-200"}`}
        >
          <Feather name="arrow-left" size={20} color={isDark ? "#8B93A8" : "#475569"} />
        </Pressable>
        <Text className={`ml-3 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Accuracy
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        {/* Top Overall Accuracy Card */}
        <LinearGradient
          colors={isDark ? ["#292A3A", "#1E1F2E"] : ["#ffffff", "#ffffff"]}
          className={`rounded-3xl p-5 mb-6 shadow-xl ${isDark ? "border border-[rgba(255,255,255,0.05)]" : "border border-slate-100"}`}
        >
          <Text
            className={`font-bold text-sm tracking-wide mb-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Overall Accuracy
          </Text>

          <View className="items-center justify-center mb-6 mt-4 relative">
            <Svg width={140} height={140} viewBox="0 0 120 120">
              <Defs>
                <SvgLinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#D4E95E" />
                  <Stop offset="100%" stopColor="#3B82F6" />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx="60"
                cy="60"
                r={ringRadius}
                stroke={isDark ? "#1A1C29" : "#e2e8f0"}
                strokeWidth={ringStroke}
                fill="none"
              />
              <Circle
                cx="60"
                cy="60"
                r={ringRadius}
                stroke="url(#ringGrad)"
                strokeWidth={ringStroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeDashoffset}
                transform="rotate(-90 60 60)"
              />
            </Svg>
            <View className="absolute items-center justify-center">
              <Text
                className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {percentage}%
              </Text>
              <Text
                className={`text-[10px] font-bold mt-0.5 ${isDark ? "text-[#8B93A8]" : "text-slate-500"}`}
              >
                Accuracy
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between" style={{ gap: 8 }}>
            <GlassStatCard label="Correct" value={data?.overall.correct ?? 0} />
            <GlassStatCard label="Wrong" value={data?.overall.wrong ?? 0} />
            <GlassStatCard label="Total" value={data?.overall.total ?? 0} />
          </View>
        </LinearGradient>

        {/* Tab Bar */}
        <View className="flex-row mb-6 justify-between px-1">
          {SCOPES.map((s) => {
            const isActive = scope === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setScope(s.key)}
                className={`px-4 py-2 rounded-full ${isActive ? "bg-[#3B82F6]" : "bg-transparent"}`}
              >
                <Text
                  className={`text-[13px] ${
                    isActive ? "text-white font-bold" : "text-[#6B7280] font-medium"
                  }`}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Main Content Area */}
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-10" />
        ) : scope === "learning" ? (
          <View
            className={`rounded-3xl p-5 mb-8 shadow-md border ${isDark ? "bg-[#1C1D2A] border-[rgba(255,255,255,0.02)]" : "bg-white border-slate-100"}`}
          >
            <View className="flex-row items-center mb-6">
              <Feather name="activity" size={20} color="#3B82F6" className="mr-3" />
              <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Learning Activity
              </Text>
            </View>

            {data?.learning_activity.by_skill.map((s) => {
              const w = Math.min(100, Math.max(0, s.score));
              return (
                <View key={s.skill} className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <View>
                      <Text
                        className={`font-bold text-[14px] mb-0.5 ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        {s.skill}
                      </Text>
                      <Text
                        className={`text-[11px] ${isDark ? "text-[#6B7280]" : "text-slate-500"}`}
                      >
                        Advanced
                      </Text>
                    </View>
                    <Text
                      className={`text-[13px] font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                      {s.score}%
                    </Text>
                  </View>
                  <View
                    className={`h-[3px] rounded-full overflow-hidden ${isDark ? "bg-[#2D3047]" : "bg-slate-200"}`}
                  >
                    <View className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${w}%` }} />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View
            className={`rounded-3xl pt-5 pb-4 mb-8 shadow-md border overflow-hidden ${isDark ? "bg-[#1C1D2A] border-[rgba(255,255,255,0.02)]" : "bg-white border-slate-100"}`}
          >
            <CustomLineChart
              communication={data?.interview_charts?.communication || []}
              behavior={data?.interview_charts?.behavior || []}
              isDark={isDark}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
